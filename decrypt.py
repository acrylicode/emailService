from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import base64

#python3 -m pip install pycryptodome
qrData = "X7OOLHHb46CzpIn35IWPbeOCzutsb2VvFxI8eqI+YP8="


enc = base64.b64decode(qrData)
derived_key = base64.b64decode("LefjQ2pEXmiy/nNZvEJ43i8hJuaAnzbA1Cbn1hOuAgA=")
iv = "1020304050607080"
cipher = AES.new(derived_key, AES.MODE_CBC, iv.encode('utf-8'))
print(unpad(cipher.decrypt(enc),16)) # b'hello'
