import os, re, io, requests, fitz, socket
from requests.exceptions import ConnectionError
from urllib3.exceptions import NameResolutionError, MaxRetryError
from unidecode import unidecode

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
        ''
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
        try:
            self.response = requests.get(self.url)
            if self.response.status_code == 200:
                with open(file_dir, 'w', encoding="ascii") as txt_file:
                    doc = fitz.open(stream=self.response.content, filetype="pdf")
                    full_text = ""
                    for page in doc:
                        output = page.get_text("blocks")
                        for block in output:
                            if block[6] == 0: # [6] is block_type 0 is for text block
                                if len(block[4].split()) > 5:
                                    text = unidecode(block[4]) # [4] is text string
                                    text = text.strip()
                                    text = text.replace("\n", " ")
                                    text = text.replace("- ", "")
                                    ref_pattern = r'^\[\d{1,3}\]'   # referenzen am ende entfernen
                                    abs_pattern = r'[a-zA-Z]'       # strings ohne buchstaben entfernen
                                    if not re.match(abs_pattern, text):
                                        continue
                                    if not re.match(ref_pattern, text):
                                        full_text += text + " "
                    doc.close()
                    txt_file.write(full_text)
                print(f"--- pdf content written to temp file '{file_dir}'.")
            else:
                print(f"--- failed to read the pdf. status code: {self.response.status_code}")
                return False
        except ConnectionError as e:
            print(f"--- an error occurred: '{str(e)}'")
            return False
        except NameResolutionError as e:
            print(f"--- an error occurred: '{str(e)}'")
            return False
        except MaxRetryError as e:
            print(f"--- an error occurred: '{str(e)}'")
            return False
        except socket.gaierror as e:
            print(f"--- an error occurred: '{str(e)}'")
            return False
        except Exception as e:
            print(f"--- an error occurred: '{str(e)}'")
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
