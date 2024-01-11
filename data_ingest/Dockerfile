FROM python:3.10
RUN apt-get update && apt-get install -y cron

WORKDIR /scraper
COPY ./requirements.txt /scraper/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

ADD ./cronjobs/daily_scraper /etc/cron.d/daily-scraper
RUN chmod 0644 /etc/cron.d/daily-scraper
RUN crontab /etc/cron.d/daily-scraper

CMD ["cron", "-f"]

#COPY ./cronjobs/* /etc/cron.d/
#CMD ["cron", "-f"]