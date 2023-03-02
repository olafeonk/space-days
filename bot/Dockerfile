FROM python3.11

RUN pip3 install aiogram

WORKDIR ~/bot

COPY . .

ENTRYPOINT ["python", "bot.py"]