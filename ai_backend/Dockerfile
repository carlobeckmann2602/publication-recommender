FROM python:3.10
RUN pip install --root-user-action=ignore --no-cache-dir  --upgrade torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
WORKDIR /code
RUN mkdir app/
COPY ./requirements.txt /code/requirements.txt
RUN pip install --root-user-action=ignore --no-cache-dir --upgrade -r /code/requirements.txt

CMD ["/bin/sh","-c",\
    "pip install --root-user-action=ignore --upgrade -r /code/requirements.txt"]
