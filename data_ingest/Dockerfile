FROM python:3.10

RUN apt-get update && apt-get install -y cron

WORKDIR /app

COPY . /app

RUN pip install -r requirements.txt

ADD crontab /etc/cron.d/scraper-cron

RUN chmod 0644 /etc/cron.d/scraper-cron

RUN crontab /etc/cron.d/scraper-cron

CMD ["cron", "-f"]