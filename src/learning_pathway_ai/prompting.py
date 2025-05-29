import os
import json
import requests

# using temporary until we can use open ai integration
def call_ollama(prompt, model="mistral"):
    try:
        response = requests.post("http://localhost:11434/api/generate", json={
            "model": model,
            "prompt": prompt,
            "stream": False
        })
        return response.json()["response"]
    except Exception as e:
        return f"❌ Error calling Ollama: {e}"


concept_name_lookup = {
    "A": "What is Astronomy?",
    "B": "Solar System",
    "C": "The Sun",
    "D": "Nuclear Fusion",
    "E": "Terrestrial Planets",
    "F": "Gas Giant Planets",
    "G": "Asteroid Belt",
    "H": "Dwarf Planets",
    "I": "Oort Cloud and Comets",
    "J": "Earth (and how it compares to other)",
    "K": "Stars",
    "L": "Moon",
    "M": "Space Exploration and Astronauts",
    "N": "Constellation and the Night Sky",
    "O": "Black Holes and Other Celestial Objects",
    "P": "Gravity",
    "Q": "Technological Advancements",
    "R": "What is a Galaxy?",
    "S": "The Milky Way",
    "T": "Nuclear Fusion",
    "U": "Dark Matter and Dark Energy",
    "V": "Space Race",
    "W": "The Universe",
    "X": "The Big Bang Theory"
}

# function to actual prompt ollama
def generate_learning_pathway(question_text, grade_band, tags, output_type):
    results = []
    for tag in tags:
        concept = concept_name_lookup.get(tag, f"[Unknown concept: {tag}]")
        
        if output_type == "explanation":
            prompt = (
                f"Explain the concept of {concept} to a {grade_band} student using simple language and a real-world example. "
                f"Then explain it specifically in the context of this question: \"{question_text}\""
            )
        elif output_type == "visual":
            prompt = (
                f"Describe a labeled diagram that shows or illustrates the concept of {concept}. "
                f"The visual should be easy to understand for a {grade_band} student and help them grasp the concept more clearly. "
                f"Then explain it specifically in the context of this question: \"{question_text}\""
            )
        elif output_type == "practice":
            prompt = (
                f"Write a multiple-choice question for a {grade_band} student about the concept of {concept}. "
                f"Include four answer choices, the correct answer, and a brief explanation of why it is correct."
            )
        else:
            continue  # skip invalid types

        reply = call_ollama(prompt)
        results.append({
            "concept": concept,
            "prompt": prompt,
            "response": reply,
            "output_type": output_type
        })

    return results

# generating something new or fetching if it already exists
def get_or_generate_pathway(student_id, question_text, metadata, output_type):
    safe_q = question_text[:30].replace(" ", "_").replace("?", "").replace("/", "-")
    fname = f"learning_pathways/{student_id}_{safe_q}_{output_type}.json"

    if os.path.exists(fname):
        print(f"✅ Loaded cached content from: {fname}")
        with open(fname, "r") as f:
            return json.load(f)

    print("⚡ Generating new learning pathway content...")
    results = generate_learning_pathway(
        question_text=question_text,
        grade_band=metadata["grade_band"],
        tags=metadata["tags"],
        output_type=output_type
    )

    os.makedirs("learning_pathways", exist_ok=True)
    with open(fname, "w") as f:
        json.dump(results, f, indent=2)

    return results

with open("concept_mapping/astronomy/K-2Concepts.json", "r") as f:
    questions = json.load(f)

# test
student_id = input("Enter student ID: ").strip()
question_text = input("Enter the question the student got wrong: ").strip()
output_type = input("What kind of GenAI support do you want? (explanation / visual / practice): ").strip().lower()

metadata = next((q for q in questions if q["question"] == question_text), None)

if not metadata:
    print("❌ Question not found.")
    exit()

result = get_or_generate_pathway(student_id, question_text, metadata, output_type)

print("\n🧠 Final AI Output:\n")
for entry in result:
    print(f"\n--- Concept: {entry['concept']} ---")
    print("Prompt:\n", entry["prompt"])
    print("Response:\n", entry["response"])


# tldr: eventually store each prompt and username to easily refresh instead of calling llm multiple times