FROM python:3.10
WORKDIR /code
RUN pip install --root-user-action=ignore --no-cache-dir  --upgrade torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
COPY ./requirements.txt /code/requirements.txt
RUN pip install --root-user-action=ignore --no-cache-dir --upgrade -r /code/requirements.txt

CMD ["/bin/sh","-c",\
    "pip install --root-user-action=ignore --upgrade -r /code/requirements.txt && \
    uvicorn app.main:rec_api --host 0.0.0.0 --port $PORT"]
