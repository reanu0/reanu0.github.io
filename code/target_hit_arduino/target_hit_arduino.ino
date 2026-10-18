// Target Hit - Arduino side
// Jack Rengelink s3631419 & Reanu Ali s3649660
// Module 2, Physical computing final project
//
// Sends the potentiometer (x) and LDR (y) to Processing as "pot,ldr" lines,
// and listens for commands back:
//   'A' / 'a'  red LED on / off   (targets are being placed)
//   'B' / 'b'  green LED on / off (targets are being hit)
//   '0'..'4'   buzzer note for hitting target 1..5 (C, E, G, high C, high E)

const int buzzerPin = 6;
const int ldrPin = A0;
const int potPin = A1;

const int led1Pin = 2;
const int led2Pin = 4;
const int ledGND = 8;

const float notes[5] = {261.63, 329.63, 392.00, 523.25, 659.25};

unsigned long lastSend = 0;

void setup() {
    Serial.begin(9600);
    pinMode(buzzerPin, OUTPUT);

    pinMode(led1Pin, OUTPUT);
    pinMode(led2Pin, OUTPUT);
    pinMode(ledGND, OUTPUT);

    digitalWrite(ledGND, LOW);
}

void loop() {
    if (millis() - lastSend > 15) {
        int pot = 1023 - analogRead(potPin);
        int ldr = analogRead(ldrPin);
        ldr = constrain(ldr, 550, 750);
        ldr = map(ldr, 550, 750, 0, 1023);

        Serial.print(pot);
        Serial.print(",");
        Serial.println(ldr);
        lastSend = millis();
    }

    if (Serial.available()) {
        char c = Serial.read();

        if (c == 'A') digitalWrite(led1Pin, HIGH);
        else if (c == 'a') digitalWrite(led1Pin, LOW);
        else if (c == 'B') digitalWrite(led2Pin, HIGH);
        else if (c == 'b') digitalWrite(led2Pin, LOW);
        else if (c >= '0' && c <= '4') {
            int idx = c - '0';
            int dur = idx == 4 ? 400 : 200;
            tone(buzzerPin, notes[idx], dur);
        }
    }
}
