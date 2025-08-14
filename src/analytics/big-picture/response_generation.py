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

# Questions for each grade band
grade_data = {
    "K-2": [
        "How do you think glue makes things stick together?",
        "Why do you think cooking food can change how it looks and tastes?",
        "What do all of the chemical reactions have in common?",
        "What are electrons, neutrons, and protons made of?",
        "Can you name something that changes when you cook it, like an egg or a cake? Is this also a chemical reaction?",
        "What do you think bubbles mean when we mix some things together?",
        "Why do you think some things change color when mixed?",
        "What happens when you blow up a balloon? Is that a chemical reaction?",
        "If you could create a magic potion that changes color or makes bubbles, what would you put in it?",
        "Why do you think some reactions happen fast and others take a long time?",
        "Can you name some things in the world that we can’t see but know are there, like air or smells?",
        "What do you think happens when something disappears, like water drying up or a candle burning?",
        "Why do you think some things stick together, like magnets or glue?",
        "Can you think of something that changes shape but stays the same, like clay or playdough? Think about it from a molecular level."
        "If you were a scientist, what would you want to discover about things we can’t see?",
        "What are some chemical reactions we see everyday?",
        "What are some ways we use chemistry in everyday life, like cooking or cleaning?",
        "What do you think everything around us is made of?",
        "Why do you think scientists study tiny things like atoms, even though we can’t see them?",
        "What happens when you stir sugar into tea? Where does it go?",
        "Can you name some things that change from one form to another, like water turning into ice?",
        "What do you think happens when you mix different things, like salt and water?",
        "What happens when you mix different things together, like baking soda and vinegar?",
        "How do you think measuring things like weight and size helps us understand the world?"
    ],
    "3-4": [
        "How do chemical bonds affect whether something is bendy or breakable?",
        "What do you think would happen if we could break apart and rebuild molecules in everyday objects?",
        "How do the molecules in soap help wash away dirt?",
        "How do scientists use molecules to create new medicines and materials?",
        "What is matter, and how do we know that everything around us is made of it?",
        "What is a chemical reaction, and how is it different from a physical change?",
        "What do we call the substances that go into a reaction, and what do we call the substances that come out? Can you give an example?",
        "What do all of the chemical reactions have in common?",
        "What are some signs that a chemical reaction is happening?",
        "What happens when you mix baking soda and vinegar? What does the reaction produce?",
        "If you were a scientist, what kind of experiment would you do to explore chemical reactions?",
        "How do invisible forces, like static electricity or chemical bonds, help hold things together?",
        "What happens when we heat or cool different types of matter, and why do some things change more than others?",
        "Why do some substances react with each other even when we can’t see it happening?",
        "Why do some chemicals have strong smells, even when we can’t see them?",
        "If you could invent a new safety tool for working with chemicals, what would it do?",
        "What are some examples of oxidation happening in nature?",
        "What are some examples of chemicals we use in daily life that need to be handled safely?",
        "What are electrons, neutrons, and protons made of?",
        "How do molecules in a solid behave differently from molecules in a gas?",
        "What are molecules made of, and how do they stay together?",
        "How do everyday chemical reactions, like baking a cake or rust forming on metal, show us how matter changes?",
        "How do we measure different types of matter, and why is it important to use the right tools?",
        "Why do some things melt when heated, but others burn?"
    ],
    "5-6": [
        "What happens to molecular bonds when a substance undergoes a chemical reaction?",
        "How does the periodic table help scientists understand different types of matter?",
        "What happens when bonds between molecules break and reform, like in a chemical explosion?",
        "What happens at the molecular level during a chemical reaction?",
        "Why do some gases dissolve in water, while others escape into the air?",
        "How do different types of chemical bonds (covalent, ionic, and hydrogen) affect the properties of molecules?",
        "What is the difference between reactants, reagents, and products in a reaction? Can you give an example?",
        "What happens when we burn fuel, and why is it considered a chemical reaction?",
        "What do all of the chemical reactions have in common?",
        "Why do some reactions create gases, and how can we measure them?",
        "What is the difference between an exothermic and an endothermic reaction? Based on what you observed in the experiment with vinegar and baking soda inflating the balloon, which type of reaction do you think it was, and why?",
        "How do chemical bonds form “invisible links” that hold molecules together?",
        "If you could invent a new reaction to solve a real-world problem, what would it be and how would it work?",
        "Why do some chemical reactions produce effects we can’t see?",
        "What happens when we break or create chemical bonds, and how does it change a substance?",
        "If you were a chemist, what invisible forces or chemical interactions would you want to study?",
        "What role do chemical indicators play in detecting invisible substances?",
        "How do chemicals in food, medicine, or the environment impact our health?",
        "How do protons, neutrons, and electrons determine the properties of an atom?",
        "What are the three main states of matter, and can you give an example of each? How does matter change from one state to another, and what happens during that process?",
        "How do intermolecular forces affect things like water tension and viscosity?",
        "What are electrons, neutrons, and protons made of?",
        "How do engineers and scientists design stronger materials by manipulating molecular structures?",
        "What do you think happens at the atomic level when you cook food or clean with soap?",
        "How do chemical reactions change matter, and what are some examples we see in daily life?",
    ]
}

# Output folder
os.makedirs("generated_new_responses", exist_ok=True)

# Loop through grade bands and questions
for grade_label, questions in grade_data.items():
    for idx, question in enumerate(questions, start=1):
        prompt = f"You are a young child in grades {grade_label} in an Chemistry class. Answer this question:\n{question}\nAnswer:"
        responses = []

        for _ in range(150):
            response = generate_response(prompt)

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

        # Save to a separate file for each grade band + question
        filename = f"generated_new_responses/{grade_label.replace('-', '')}_question_{idx}.json"
        with open(filename, "w") as file:
            json.dump({
                "grade_band": grade_label,
                "question": question,
                "responses": responses
            }, file, indent=2)

        print(f"✔️ {grade_label} → Done: {question} → saved {len(responses)} responses.")

end = time.time()
print(f"\nAll done in {end - start:.2f} seconds.")
