import os, re, io, requests, PyPDF2

class PdfScraper:
    def __init__(self, temp_path):
        self.temp_dir = temp_path
        self.url = None
        self.temp_file = None
        self.response = None

    def read_pdf(self, url, filename):
        self.temp_file = self.temp_dir + filename + ".txt" # "https://arxiv.org/pdf/2310.10764" + ".pdf"
        if self.pull(url, self.temp_file):
            full_text = self.read(self.temp_file)
        else: full_text = None

        return full_text

    def clean(self, text):
        text = text.strip()
        text = text.replace("\n", " ")
        text = text.replace('´´', '"')
        text = text.replace('``', '"')
        text = text.replace("\'\'", '"')
        text = text.replace("- ", '')
        text = re.sub(r" +", " ", text)
        text = text.replace("\x00", ' ')
        text = text.replace("\x01", ' ')
        text = text.replace("\x10", ' ')
        text = text.replace("\x11", ' ')
        return text
    
    def pull(self, url, file_dir):
        self.url = url # "https://arxiv.org/pdf/2310.10764" + ".pdf"
        self.response = requests.get(self.url)

        if self.response.status_code == 200:
            with open(file_dir, 'w', encoding="utf-8") as txt_file:
                pdf_content = io.BytesIO(self.response.content) #self.response.content
                pdf_reader = PyPDF2.PdfReader(pdf_content)

                text = ""
                for page_number in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_number]
                    text += page.extract_text()
                text = self.clean(text)
                txt_file.write(text)

            print(f"--- pdf content written to temp file '{file_dir}'.")
        else:
            print(f"--- failed to read the pdf. status code: {self.response.status_code}")
            return False
        return True
    
    def delete(self):
        if self.temp_file is not None:
            try:
                os.remove(self.temp_file)
                print(f"--- tempfile '{self.temp_file}' has been deleted.")
            except FileNotFoundError:
                print(f"--- temp file not found: '{self.temp_file}'")
            except Exception as e:
                print(f"--- an error occurred: '{str(e)}'")
            self.temp_file = None

    def read(self, file_dir):
        if file_dir is not None:
            with open(file_dir, "r", encoding="utf-8") as txt_file:
                file_content = txt_file.read()
                #file_content = self.clean(file_content)
            #self.delete()
        return file_content
    
    def _read_author(self, content):
        pass
