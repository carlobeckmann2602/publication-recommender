# ids before 2008: category/YYMMXXX
# ids 2008-2014: YYMM.XXXX
# ids from 2015: YYMM.XXXXX

year = 2023

if __name__ == '__main__':
    print("\nYear "+str(year)+" scraper start ...")

    yy_str = str(year)[2:4]

    for month in range(1,13):
        mm_str = '{:02d}'.format(month)
        num_counter = 0
        
        while num_counter <= 10:
            if year > 2014:
                num_str = '{:05d}'.format(num_counter)
            elif year < 2015 and year > 2007:
                num_str = '{:04d}'.format(num_counter)
            elif year < 2008:
                num_str = '{:03d}'.format(num_counter)
            
            arxiv_id = yy_str+mm_str+"."+num_str
            print(arxiv_id)
            num_counter += 1

            # in 100er schritten
                # ids sichern
                # über api abfragen
                # in metadaten sichenr
                # ids updaten
                # wenn noch nicht in db vorhanden
                    # pdf lesen
                    # vektoren generieren
                    # in pub list sichern
                    # in db sichern
                # metadaten updaten
