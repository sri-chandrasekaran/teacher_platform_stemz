from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import random
import json
from huggingface_hub import login
import time
import os

start = time.time()

# Login to Hugging Face
login("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")

# Model setup
model_name = "tiiuae/falcon-rw-1b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token
model = AutoModelForCausalLM.from_pretrained(model_name)

# Device setup
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Function to generate a single response
def generate_response(prompt):
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=60,
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id,
        do_sample=True,
        temperature=0.7,
        top_p=0.9
    )
    decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "Answer:" in decoded:
        return decoded.split("Answer:")[-1].strip()
    else:
        return decoded.strip()

# Your list of questions
questions = [
<<<<<<< HEAD
    "Can you think of a real-life situation where we use conditions, like \"if it’s raining, take an umbrella\"?",
    "Why do you think computers store information in different variables instead of writing everything at once?",
    "How does coding teach us to break big problems into smaller steps?",
    "Why do you think professional coders use loops and conditionals instead of writing long lists of instructions?",
    "How can coding help in fields like science, engineering, or even music and art?",
    "How do you think learning to code can help with problem-solving in everyday life?"
=======
    "What would it take for humans to live on another planet, and which planet do you think would be the best choice?",
    "How do supermassive black holes influence galaxy formation and evolution?",
    "What role does dark matter play in the formation and structure of galaxies?",
    "What roles do gravity play in galaxies?",
    "What are some of the biggest unanswered questions in astronomy today?",
    "What are the ethical and environmental concerns of space exploration?",
    "Have you heard of Newton's Laws? If so what are they?",
    "How do different types of telescopes (radio, optical, space-based) help us understand the universe?",
    "What are some benefits of humans exploring space? What are some consequences?",
    "How does zero gravity affect the human body, and how do astronauts prepare for it?",
    "How have technological advancements improved space exploration over the past 50 years?",
    "If you were in charge of a space mission, what would you want to explore, and how would you do it?",
    "How do black holes challenge our understanding of physics and space-time?",
    "What do you think will be the next major discovery in space science?",
    "What does studying other planets teach us about our own place in the Solar System?",
    "If we could travel to the edge of the universe, what do you think we would find?",
    "Why is it important to study astronomy? What do we gain from exploring space?",
    "Why do scientists believe that most of the universe is made of dark matter and dark energy?",
    "What do you think would happen to a human approaching a place hole? How about time and space near one?",
    "What tools and experiments are scientists using to study the mysteries of space?",
    "How does gravity control the movement of galaxies and stars?",
    "What do scientists look for when searching for life on other planets, and do you think we will ever find it?",
    "How do space missions, like rovers and satellites, help us learn more about our Solar System?",
    "How do different technologies, like AI and robotics, help scientists explore space in ways humans can't?",
    "How do different planets' atmospheres affect their ability to support life?"


>>>>>>> main
]



# Output folder
os.makedirs("generated_new_responses", exist_ok=True)

# Loop through questions and generate responses
for idx, question in enumerate(questions, start=1):
<<<<<<< HEAD
    k2_prompt = f"You are a young child in grades K-2. Answer this question:\n{question}\nAnswer:"
=======
    k2_prompt = f"You are a young child in grades 5-6 in an Astronomy class. Answer this question:\n{question}\nAnswer:"
>>>>>>> main
    responses = []

    for _ in range(150):
        response = generate_response(k2_prompt)

        scores = {
            "Creativity": random.randint(1, 20),
            "Critical Thinking": random.randint(1, 20),
            "Observation": random.randint(1, 20),
            "Curiosity": random.randint(1, 20),
            "Problem Solving": random.randint(1, 20)
        }

        responses.append({
            "response": response,
            **scores
        })

    # Save to a separate file for each question
    filename = f"generated_new_responses/question_{idx}.json"
    with open(filename, "w") as file:
        json.dump({
            "question": question,
            "responses": responses
        }, file, indent=2)

    print(f"✔️ Done: {question} → saved {len(responses)} responses.")

end = time.time()
print(f"\nAll done in {end - start:.2f} seconds.")
