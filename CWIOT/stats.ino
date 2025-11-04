#include "config.h"



//------------------WIRING------------------
// VCC -> 3.3V or 5V
// TRIG -> Digital pin 12
#define trigPin 25  // define TrigPin
// ECHO -> Digital pin 11
#define echoPin 26  // define EchoPin.
// GND -> GND




// set up the 'digital' feed
AdafruitIO_Feed *scoreFeed = io.feed("score-feed");





// ----------VARIABLES-----------
#define MAX_DISTANCE 200  // Maximum sensor distance is rated at 400-500cm.
// define the timeOut according to the maximum range. timeOut= 2*MAX_DISTANCE /100 /340 *1000000 = MAX_DISTANCE*58.8
float timeOut = MAX_DISTANCE * 60;
int soundVelocity = 340;  // define sound speed=340m/s

int dist;


int compteurPrevious = 0;
int compteurCurrent = 0;

int detect = 0;



void setup() {
  pinMode(trigPin, OUTPUT);  // set trigPin to output mode
  pinMode(echoPin, INPUT);   // set echoPin to input mode


  // start the serial connection
  Serial.begin(115200);

  // wait for serial monitor to open
  while(! Serial);

  // connect to io.adafruit.com
  Serial.print("Connecting to Adafruit IO");
  io.connect();

  // set up a message handler for the 'digital' feed.
  // the handleMessage function (defined below)
  // will be called whenever a message is
  // received from adafruit io.
//  digital->onMessage(handleMessage);

  // wait for a connection
  while(io.status() < AIO_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  // we are connected
  Serial.println();
  Serial.println(io.statusText());


}


int getDistance() {
  unsigned long pingTime;
  float distance;
  digitalWrite(trigPin, HIGH);  // make trigPin output high level lasting for 10μs to trigger HC_SR04,
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  pingTime = pulseIn(echoPin, HIGH, timeOut);              // Wait for HC-SR04 to return to the high level and measure out this waiting time
  distance = (float)pingTime * soundVelocity / 2 / 10000;  // calculate the distance according to the time
  int distanceint = int(round(distance));                  // translate the distance to an int number
  return distanceint;                                      // return the distance value
}


void loop() {

  io.run();


  dist = getDistance();

  delay(100);  // Wait 100ms between pings (about 20 pings/sec). 29ms should be the shortest delay between pings.
  Serial.print("Ping: ");
  Serial.print(dist);  // Send ping, get distance in cm and print result (0 = outside set distance range)
  Serial.println("cm");

if (dist < 20) {
    detect++;
  }

  if (detect > 0) {
    compteurCurrent++;
    if (compteurCurrent != compteurPrevious) {
      scoreFeed->save(compteurCurrent);
      
    }
    detect = 0;
    compteurPrevious=compteurCurrent;
    delay(1500);
  }

  Serial.print("Compteur: ");
  Serial.println(compteurCurrent);
}





