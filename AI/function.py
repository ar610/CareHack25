from openai import OpenAI, AzureOpenAI
from dotenv import load_dotenv
from os import environ
import json

load_dotenv()

endpoint = environ.get("AZURE_OPENAI_ENDPOINT")
key = environ.get("AZURE_OPENAI_API_KEY")




from openai import AzureOpenAI
import json

# Initialize Azure OpenAI client

client = AzureOpenAI(
    api_key=key,
    api_version="",  # or the version you're using
    azure_endpoint=endpoint
)


def extract_medical_info(raw_text: str) -> dict:
    """
    Extract medications, vaccinations, allergies, and medical conditions from raw medical text.

    Args:
        raw_text (str): Unstructured medical input text.

    Returns:
        dict: Dictionary containing extracted fields.
    """
    prompt = f"""
Extract and return the following fields as a JSON object:

- type of record (prescription, Discharge Summaries,Progress Notes,Diagnostic Reports
)
-date of upload[create it]
if it's a medical prescription, extract:
-medications (currently taken) 
- end_date : date upto which the medication is taken (Calculate based on frequency and duration)
-vaccinations (already taken)
-allergies
-medical_conditions (diagnosed)
- tests (if mentioned) [And significant test(only if necessary) results if available]

- medications (currently taken)
- vaccinations (already taken)
- allergies
- medical_conditions (diagnosed)
- tests (if mentioned) [And significant test(only if necessary) results if available]
Text:
\"\"\"
{raw_text}
\"\"\"

Return JSON in the format (return only the JSON):
{{
  "medications": [...],
  "vaccinations": [...],
  "allergies": [...],
  "medical_conditions": [...]
}}

Also provide the summary of the above extracted information in a human-readable format single pargraph RAG traceable.Important: Ensure the JSON is valid and parsable.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # use the correct deployment name here
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        content = response.choices[0].message.content
        return json.loads(content)
    except json.JSONDecodeError:
        print("⚠️ Could not parse JSON output. Raw response:")
        print(content)
        return {}
    except Exception as e:
        print(f"❌ Error during OpenAI call: {e}")
        return {}


text = """The patient has been diagnosed with Type 2 Diabetes and Hypertension.
He is currently taking Metformin and Amlodipine.
COVID-19 vaccine was administered in 2021.
He has a penicillin allergy and reported occasional migraines."""

if __name__ == "__main__":
    extracted_info = extract_medical_info(text)
    print(json.dumps(extracted_info, indent=2))