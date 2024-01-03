FROM python:3.10
WORKDIR /code
RUN mkdir app/
COPY ./requirements.txt /code/requirements.txt
RUN pip install --root-user-action=ignore --no-cache-dir --upgrade -r /code/requirements.txt

RUN useradd -ms /bin/bash -u 1000 non_root
RUN chown -R non_root:non_root /code
# USER non_root