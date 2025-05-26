import json
import requests

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


with open("astronomy/K-2Concepts.json", "r") as f:
    questions = json.load(f)

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

question_text = input("Enter the question the student got wrong: ")

metadata = next((q for q in questions if q["question"] == question_text), None)

if not metadata:
    print("❌ Question not found.")
    exit()

tags = metadata["tags"]
concepts = [concept_name_lookup.get(tag, f"[Unknown concept: {tag}]") for tag in tags]

grade_band = metadata["grade_band"]

output_type = input("What kind of GenAI support do you want? (explanation / visual / practice): ").strip().lower()

prompts = []

for concept in concepts:
    if output_type == "explanation":
        prompt = (
            f"Explain the concept of {concept} to a {grade_band} student using simple language and a real-world example. "
            f"Then explain it specifically in the context of this question: \"{question_text}\""
        )
    elif output_type == "visual":
        prompt = (
            f"Describe a labeled diagram that shows or illustrates the concept of {concept}. "
            f"The visual should be easy to understand for a {grade_band} student and help them grasp the concept more clearly."
            f"Then explain it specifically in the context of this question: \"{question_text}\""
        )
    elif output_type == "practice":
        prompt = (
            f"Write a multiple-choice question for a {grade_band} student about the concept of {concept}. "
            f"Include four answer choices, the correct answer, and a brief explanation of why it is correct."
        )
    else:
        prompt = f"(Invalid type selected — defaulted to explanation about {concept})"

    prompts.append(prompt)



print("\n🧠 Generating Local LLM Responses with Ollama...\n")

for p in prompts:
    print("\n---\nPrompt:\n", p)
    reply = call_ollama(p)
    print("\nResponse:\n", reply)

