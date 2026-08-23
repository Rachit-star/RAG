from llm import client

def generate_hypothetical_answer(question: str) -> str:
    response = client.chat.completions.create(
        model="meta/llama-3.1-8b-instruct",
        messages=[
            {
                "role": "system",
                "content": "Write a short, plausible passage from an academic paper on chaos-based image encryption that would answer this question. Stay within that specific technical domain — do not invent unrelated topics, fields, or subject matter. If the question is about document metadata (authors, title, publication info) rather than technical content, respond with just the question restated plainly instead of inventing details.",
            },
            {"role": "user", "content": question},
        ],
    )
    return response.choices[0].message.content