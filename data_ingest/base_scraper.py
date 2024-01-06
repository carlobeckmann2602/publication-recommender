import csv, json, requests
from ast import literal_eval
from publications import ArxivPublication

class BaseScraper:
    def __init__(self, tmp_id_list, tmp_metadata_list, tmp_pub_list, ax_api, db_api, sc_pdf, tmp_state_data=None):
        self.tmp_id_list = tmp_id_list
        self.tmp_metadata_list = tmp_metadata_list
        self.tmp_pub_list = tmp_pub_list
        self.tmp_state_data = tmp_state_data
        self.ax_api = ax_api
        self.db_api = db_api
        self.sc_pdf = sc_pdf

    def save_id_list(self, id_list):
        print("--- writing " + str(len(id_list)) + " entries to '" + self.tmp_id_list + "' ...")
        with open(self.tmp_id_list, 'w', newline='') as file:
            writer = csv.writer(file)
            for id in id_list:
                writer.writerow([id])
        return True

    def save_metadata_list(self, metadata_list):
        print("--- writing " + str(len(metadata_list)) + " entries to '" + self.tmp_metadata_list + "' ...")
        with open(self.tmp_metadata_list, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["arxiv_id", "title", "authors", "src", "url", "pub_date", "upd_date", "doi", "abstract"])
            for pub in metadata_list:
                writer.writerow([pub.arxiv_id, pub.title, pub.authors, pub.src, pub.url, pub.pub_date, pub.upd_date, pub.doi, pub.abstract])
        return True

    def save_pub_list(self, pub_list):
        print("--- writing " + str(len(pub_list)) + " entries to '" + self.tmp_pub_list + "' ...")
        with open(self.tmp_pub_list, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["arxiv_id", "title", "authors", "src", "url", "pub_date", "upd_date", "doi", "abstract", "vector_dict"])
            for pub in pub_list:
                writer.writerow([pub.arxiv_id, pub.title, pub.authors, pub.src, pub.url, pub.pub_date, pub.upd_date, pub.doi, pub.abstract, pub.vector_dict])
        return True

    def read_id_list(self):
        print("-- reading ids from '" + self.tmp_id_list + "' ...")
        id_list = list()
        with open(self.tmp_id_list, 'r') as file:
            reader = csv.reader(file)
            for row in reader:
                id = row[0]
                id_list.append(id)
        id_list = list(set(id_list))
        id_list.sort()
        print("--- found " + str(len(id_list)) + " ids.")
        return id_list

    def read_metadata_list(self):
        print("-- reading publication metadata from '" + self.tmp_metadata_list + "' ...")
        metadata_list = list()
        with open(self.tmp_metadata_list, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                pub = ArxivPublication(
                    arxiv_id=row['arxiv_id'], 
                    title=row['title'], 
                    authors=literal_eval(row['authors']), 
                    src=row['src'], 
                    url=row['url'], 
                    pub_date=row['pub_date'], 
                    upd_date=row['upd_date'], 
                    doi=literal_eval(row['doi']), 
                    abstract=row['abstract'],
                    vector_dict=None
                )
                metadata_list.append(pub)
        metadata_list = list(set(metadata_list))
        print("--- found metadata of " + str(len(metadata_list)) + " publications.")
        return metadata_list

    def read_pub_list(self):
        print("-- reading publications from '" + self.tmp_pub_list + "' ...")
        pub_list = list()
        with open(self.tmp_pub_list, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                pub = ArxivPublication(
                    arxiv_id=row['arxiv_id'], 
                    title=row['title'], 
                    authors=literal_eval(row['authors']), 
                    src=row['src'], 
                    url=row['url'], 
                    pub_date=row['pub_date'], 
                    upd_date=row['upd_date'], 
                    doi=literal_eval(row['doi']), 
                    abstract=row['abstract'],
                    vector_dict=literal_eval(row['vector_dict'])
                )
                pub_list.append(pub)
        pub_list = list(set(pub_list))
        print("--- found " + str(len(pub_list)) + " publications.")
        return pub_list

    def get_metadata_list(self, id_list):
        full_metadata_list = list()
        # rufe daten zu ids in 100er blöcken über api ab
        block_size = 100
        block_list = [id_list[i:i + block_size] for i in range(0, len(id_list), block_size)]
        #for i, chunk in enumerate(block_list, start=1):
            #print(f"Chunk {i}: {len(chunk)}")
        for block in block_list:
            metadata_list = self.ax_api.scrape_by_id_list(block, block_size)
            if len(metadata_list) > 0:
                full_metadata_list.extend(metadata_list)
        print("-- collected metadata of " + str(len(full_metadata_list)) + " publications.")
        return full_metadata_list

    def update_id_list(self, id_list, metadata_list):
        to_remove = list()
        print("-- removing successfully scraped metadata from tmp_id_list ...")
        for pub in metadata_list:
            to_remove.append(pub.arxiv_id)
        filtered_id_list = [item for item in id_list if item not in to_remove]
        # update id list
        if self.save_id_list(filtered_id_list):
            return filtered_id_list
        else: return id_list

    def update_metadata_list(self, metadata_list, pub_list):
        to_remove = list()
        print("-- removing successfully scraped publications from tmp_metadata_list ...")
        for pub in pub_list:
            to_remove.append(pub.arxiv_id)
        filtered_metadata_list = [item for item in metadata_list if item.arxiv_id not in to_remove]
        # update metadata list
        if self.save_metadata_list(filtered_metadata_list):
            return filtered_metadata_list
        else: return metadata_list

    def update_pub_list(self, pub_list, stored_list):
        to_remove = list()
        for pub in stored_list:
            to_remove.append(pub.arxiv_id)
        filtered_pub_list = [item for item in pub_list if item.arxiv_id not in to_remove]
        # update pub list
        if self.save_pub_list(filtered_pub_list):
            return filtered_pub_list
        else: return pub_list

    def read_pdf_and_calc_vectors(self, pub):
        print("-- collect pdf content of publication id '" + str(pub.arxiv_id) + "' ...")
        pdf_text = self.sc_pdf.read_pdf(pub.url, pub.arxiv_id)
        if pdf_text is None:
            self.sc_pdf.delete()
            return False, pub
        vector_dict = None
        file_param = {"file": open("/scraper/data/temp/"+pub.arxiv_id+".txt", "rb")}
        res_ai_api = requests.post("http://ai_backend:8000/summarize?tokenize=true&amount=5", files=file_param)
        if res_ai_api.status_code == 200:
            vector_dict = json.loads(res_ai_api.text)
            pub.vector_dict = vector_dict
            print("-- vector calculation for publication id '" + str(pub.arxiv_id) + "' successful.")
            self.sc_pdf.delete()
            #print("-- response: "+str(vector_dict["0"]["token"]))
        else:
            print("-- vector calculation for publication id '" + str(pub.arxiv_id) + "' failed.")
            self.sc_pdf.delete()
            return False, pub
        #print("-- collected vector data of " + str(len(pub_list)) + " publications.")
        return True, pub

    # year scraper 
    def create_id_block(self, year, month, num_counter, size):
        id_block = list()
        yy_str = str(year)[2:4]
        mm_str = '{:02d}'.format(month)
        # ids before 2008: category/YYMMXXX
        # ids 2008-2014: YYMM.XXXX
        # ids from 2015: YYMM.XXXXX
        while True:
            if year > 2014:
                num_str = '{:05d}'.format(num_counter)
            elif year < 2015 and year > 2007:
                num_str = '{:04d}'.format(num_counter)
            elif year < 2008:
                num_str = '{:03d}'.format(num_counter)
                
            arxiv_id = yy_str+mm_str+"."+num_str

            if not self.db_api.get_arxiv_pub_by_id(arxiv_id):
                id_block.append(arxiv_id)

            num_counter += 1
            mod = (num_counter)%size
            if mod == 0:
                return num_counter, id_block
        
    def request_id_block(self, id_block):
        print(len(id_block))
        metadata_list = self.ax_api.scrape_by_id_list(id_block, len(id_block))
        print("-- collected metadata of " + str(len(metadata_list)) + " publications.")
        return metadata_list
    
    def save_state_data(self, year, month, metadata_list):
        print("--- writing state data to '" + self.tmp_state_data + "' ...")
        id_list = list()
        for pub in metadata_list:
            id_list.append(pub.arxiv_id)
        id_list.sort()
        
        max_id = id_list[-1]
        max_num = int(max_id[5:])

        with open(self.tmp_state_data, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["year", "month", "max_num"])
            writer.writerow([year, month, max_num])
        return True
    
    def read_state_data(self):
        print("-- reading state data from '" + self.tmp_state_data + "' ...")
        state_data = None
        with open(self.tmp_state_data, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                entry = {
                    "year": literal_eval(row['year']),
                    "month": literal_eval(row['month']),
                    "max_num": literal_eval(row['max_num'])
                }
                state_data = entry
        if state_data is not None:
            print("--- found state data: "+str(state_data))
        return state_data