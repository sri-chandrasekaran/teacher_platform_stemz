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
    "What do you think happens when a computer remembers something, like your name or a number?",
    "Why do you think we need numbers to tell a computer where things go on the screen?",
    "How do you know where you are in a room? How do computers know where things are?",
    "Can you think of a time when you had to follow steps in a certain order? What happens if you mix them up?",
    "Why do you think computers have to follow instructions exactly?",
    "How do we use numbers every day, and how do you think computers use numbers?",
    "What does it mean to \"store\" information? Where do you think computers keep information?",
    "Why do you think it’s important to be able to change numbers in a program?",
    "How do directions like left, right, up, and down help computers know where to move things?",
    "Can you think of a time when you had to wait for the right moment to do something? How do you think computers know when to do things?"
]

# Output folder
os.makedirs("generated_k2_responses", exist_ok=True)

# Loop through questions and generate responses
for idx, question in enumerate(questions, start=1):
    k2_prompt = f"You are a young child in grades K-2. Answer this question:\n{question}\nAnswer:"
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
    filename = f"generated_k2_responses/question_{idx}.json"
    with open(filename, "w") as file:
        json.dump({
            "question": question,
            "responses": responses
        }, file, indent=2)

    print(f"✔️ Done: {question} → saved {len(responses)} responses.")

end = time.time()
print(f"\nAll done in {end - start:.2f} seconds.")
