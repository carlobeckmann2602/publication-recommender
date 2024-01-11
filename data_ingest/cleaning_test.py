import fitz, re, requests  # PyMuPDF
from unidecode import unidecode

def extract_titles_and_text(url):
    response = requests.get(url)
    doc = fitz.open(stream=response.content, filetype="pdf")
    full_text = ""
    for page in doc:
        output = page.get_text("blocks")
        for block in output: # [4] is text string, [5] is block sequence number, [6] is block_type 0 is for text block
            if block[6] == 0: # We only take the text
                if len(block[4].split()) > 5:
                    text = unidecode(block[4])
                    text = text.strip()
                    text = text.replace("\n", " ")
                    text = text.replace("- ", "")
                    ref_pattern = r'^\[\d{1,3}\]' # zitate entfernen
                    abs_pattern = r'[a-zA-Z]'
                    if not re.match(abs_pattern, text):
                        continue
                    if not re.match(ref_pattern, text):
                        full_text += text + " "
                    #print(text)
                    #print("")
    print(full_text)
    doc.close()

# Replace 'your_file.pdf' with the path to your PDF file
url = 'https://arxiv.org/pdf/2201.00129.pdf'
result = extract_titles_and_text(url)
