FROM python:3.10

RUN apt-get update && apt-get install -y cron

WORKDIR /scraper

COPY . /scraper

RUN pip install -r requirements.txt

ADD crontab /etc/cron.d/daily-scraper

RUN chmod 0644 /etc/cron.d/daily-scraper

RUN crontab /etc/cron.d/daily-scraper

CMD ["cron", "-f"]