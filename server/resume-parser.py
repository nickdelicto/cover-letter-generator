import nltk
nltk.download('stopwords')


import sys
import json
from pyresparser import ResumeParser

def parse_resume(file_path):
    data = ResumeParser(file_path).get_extracted_data()
    return data

if __name__ == "__main__":
    file_path = sys.argv[1]
    parsed_data = parse_resume(file_path)
    print(json.dumps(parsed_data))