#include <SimpleDHT.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

int pinDHT11 = 2;
SimpleDHT11 dht11(pinDHT11);

SoftwareSerial s(A2,A3);
void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for Native USB only
  }
  s.begin(9600);
}

void loop() {
  byte temperature = 0;
  byte humidity = 0;
  int err = SimpleDHTErrSuccess;
  if ((err = dht11.read(&temperature, &humidity, NULL)) != SimpleDHTErrSuccess) {
    s.print("Read DHT11 failed, err="); s.print(SimpleDHTErrCode(err));
    s.print(","); s.println(SimpleDHTErrDuration(err)); delay(1000);
    return;
  }
  
  DynamicJsonDocument doc(1024);
  JsonArray array = doc.to<JsonArray>();
  array.add("device_sendData");
  JsonObject param1 = array.createNestedObject();
   
  param1["temperature"] = (int)temperature;
  param1["humidity"] = (int)humidity;
  String out;
  serializeJson(doc, out);
  Serial.print(out);
  if(Serial.available()) {
    String tt = Serial.readString();
    s.println(tt);
  }
  delay(1500);
}
