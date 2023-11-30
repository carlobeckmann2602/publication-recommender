import os, io, requests, PyPDF2

class PdfCrawler:
    def __init__(self, temp_path):
        self.temp_dir = temp_path
        self.url = None
        self.temp_file = None
        self.response = None
    
    def pull(self, url, filename):
        self.url = url # "https://arxiv.org/pdf/2310.10764" + ".pdf"
        self.temp_file = self.temp_dir + filename + ".txt" # "https://arxiv.org/pdf/2310.10764" + ".pdf"
        self.response = requests.get(self.url)

        if self.response.status_code == 200:
            with open(self.temp_file, 'w', encoding="utf-8") as txt_file:
                pdf_content = io.BytesIO(self.response.content) #self.response.content
                pdf_reader = PyPDF2.PdfReader(pdf_content)

                for page_number in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_number]
                    text = page.extract_text()
                    txt_file.write(text)

            print(f"PDF content written to '{self.temp_file}'.")
        else:
            print(f"Failed to read the PDF. Status code: {self.response.status_code}")
            return False
        
        return True
    
    def delete(self):
        if self.temp_file is not None:
            try:
                os.remove(self.temp_file)
                print(f"'{self.temp_file}' has been deleted.")
            except FileNotFoundError:
                print(f"File not found: '{self.temp_file}'")
            except Exception as e:
                print(f"An error occurred: '{str(e)}'")
            self.temp_file = None

    def read(self):
        if self.temp_file is not None:
            with open(self.temp_file, "r", encoding="utf-8") as txt_file:
                file_content = txt_file.read()
            self.delete()
        return file_content
    
    def _read_author(self, content):
        pass
