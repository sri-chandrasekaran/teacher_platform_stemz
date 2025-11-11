from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import random
import json
from huggingface_hub import login
import time
import os

start = time.time()

# Login to Hugging Face

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
        "Why do you think some people are really good at remembering details, while others forget quickly?",
        "How do you know when someone is telling the truth or just playing a trick on you?",
        "If you could see inside your brain, what do you think it would look like?",
        "Have you ever thought you saw or heard something that wasn’t really there? What do you think happened?",
        "How will behavioral psychology influence how your opponent acts?",
        "How do you know when you are hungry or tired? How do you think your brain helps with that?",
        "What made us fall for these tricks?",
        "Can you think of a time when you forgot something important? What helped you remember it later?",
        "How has one memory affected your personality or choices today?",
        "On which of the 4 rounds did you do the best? Which part of the brain did you use? How did we use each of the three parts of the brain in this experiment?",
        "Can you think of a time when you made a decision? What helped you choose?",
        "What would happen if everyone could see the world differently based on their own thoughts?",
        "If you could ask a scientist one question about how our minds work, what would it be?",
        "How do you think your brain remembers things, like your favorite song or a fun day at the park?",
        "What do you think happens in your brain when you feel happy, sad, or excited?",
        "What do you think makes people feel happy or sad?",
        "What makes us choose one choice over the other?",
        "Why do you think we sometimes forget things?",
        "How do you think your brain helps you learn new things?",
        "What helps you remember things better—seeing them, hearing them, or doing them?",
        "How do you think our brains help us learn new things?"
    ],
    "3-4": [
        "How do our thoughts and feelings affect the choices we make?",
        "How does sleep help our brains organize and store memories?",
        "On which of the 4 rounds did you do the best? Which part of the brain did you use?How did we use each of the three parts of the brain in this experiment?",
        "How do emotions like fear or excitement affect the way our brain makes decisions?",
        "What techniques have helped you remember something difficult, like a spelling word or math fact?",
        "How do emotions affect what we remember?",
        "What do you think happens in your brain when you dream?",
        "If you could create an experiment to understand why people do what they do, what would you study?",
        "How do you think rewards and punishments influence behavior?",
        "What do you think would happen if we couldn’t form new memories? How would that affect our daily lives?",
        "Why do you think we remember some things easily, like our birthday, but forget what we ate for lunch last week?",
        "What do you think happens when two people remember the same event in completely different ways?",
        "How do our past experiences shape the way we react to new situations?",
        "How does the brain help us make decisions, and why do some decisions take longer than others?",
        "What makes us choose one choice over the other?",
        "How do different parts of the brain control different actions, like moving, thinking, or feeling?",
        "How has one memory affected your personality or choices today?",
        "Psychology helps us understand how people think, feel, and act. How do you think studying psychology can help us in everyday life? Can you think of a situation where understanding someone's thoughts or feelings might be useful?",
        "How has one memory affected your personality or choices today?",
        "What do you think Freud meant when he said that our unconscious mind affects our decisions?",
        "Why do you think some people are more easily tricked by illusions than others?",
        "What made us fall for these tricks?",
        "How will behavioral psychology influence how your opponent acts?"
    ],
    "5-6": [
       "How does psychology help us understand human behavior?",
       "If you could design a brain-related experiment, what would you want to test or learn about?",
       "How do scientists study memory, and what have they learned about how the brain stores information?",
       "Why do some memories fade over time, while others stay clear for years?",
       "How does our unconscious mind influence the decisions we make, even when we don’t realize it?",
       "Freud believed that our early experiences shape who we become—do you agree? Why or why not?",
       "What are some strategies used by people with exceptional memory, and can we train ourselves to do the same?",
       "Why do some people take more risks than others?",
       "How does the nervous system help us react quickly to the world around us?",
       "How will behavioral psychology influence how your opponent acts?",
       "If you could ask a psychologist anything about the human mind, what would it be and why?",
       "What made us fall for these tricks?",
       "How can understanding psychology help people improve their lives?",
       "What makes us choose one choice over the other?",
       "How do scientists study how the brain works, and what are some challenges they face?",
       "How does the placebo effect show the power of the mind over the body?",
       "On which of the 4 rounds did you do the best? Which part of the brain did you use? How did we use each of the three parts of the brain in this experiment?",
       "Why do we sometimes forget things, and how does our brain decide what to keep and what to let go?",
       "How do stress and emotions impact our ability to remember things?",
       "How do optical illusions and mental tricks reveal how our brains process information?",
       "How do psychologists study how the brain affects our thoughts and actions?",
       "How do the different parts of the brain work together to control thoughts, movements, and emotions?",
    ]
}

# Output folder
os.makedirs("generated_new_responses", exist_ok=True)

# Loop through grade bands and questions
for grade_label, questions in grade_data.items():
    for idx, question in enumerate(questions, start=1):
        prompt = f"You are a young child in grades {grade_label} in a Psychology class. Answer this question:\n{question}\nAnswer:"
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
