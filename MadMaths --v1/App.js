import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

const App = () => {
  const [level, setLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState(0);
  const [score, setScore] = useState(0);
  const [num1, setNum1] = useState(null);
  const [num2, setNum2] = useState(null);
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [notification, setNotification] = useState('');
  const [canvasText, setCanvasText] = useState([]);

  useEffect(() => {
    restartGame();
  }, [level]);

  const restartGame = () => {
    let range;
    switch (level) {
      case 1:
        range = 10;
        break;
      case 2:
        range = 20;
        break;
      case 3:
        range = 30;
        break;
      case 4:
        range = 40;
        break;
      case 5:
        range = 50;
        break;
      default:
        range = 10;
    }
    setNum1(Math.floor(Math.random() * range + 1));
    setNum2(Math.floor(Math.random() * range + 1));
    setInput1('');
    setInput2('');
    setCanvasText([]);
  };

  const startGame = (lvl) => {
    if ((lvl == 1) || (lvl <= completedLevels + 1)) {
      setLevel(lvl);
      setShowLevelSelection(false);
      setShowGameScreen(true);

    } else {
      setModalMessage('Level is locked. Complete previous levels.');
      setIsModalVisible(true);
    }
  };

  const calculate = () => {
    let add = num1 + num2;
    let sub = num1 - num2;
    let mul = num1 * num2;
    let dv = num2 !== 0 ? num1 / num2 : 'Cannot divide by zero';
    let div = Math.floor(dv * 100) / 100;

    setCanvasText([
      '___Hint___',
      `Addition: ${add}`,
      `Subtraction: ${sub}`,
      `Multiplication: ${mul}`,
      `Division: ${div}`,
    ]);
  };



  const check = () => {
    // Validate inputs
    if (input1 === '' || input2 === '' || isNaN(input1) || isNaN(input2)) {
      Alert.alert('Error', 'Please enter valid numbers.');
      return;
    }

    // Convert inputs to integers
    let numInput1 = parseInt(input1);
    let numInput2 = parseInt(input2);

    let correct1 = numInput1 === num1;
    let correct2 = numInput2 === num2;

    let message = '';
    if (correct1) message += 'First number is correct\n';
    else message += 'First number is wrong!\n';

    if (correct2) message += 'Second number is correct\n';
    else message += 'Second number is wrong!\n';

    // Display result alert and handle the game flow
    Alert.alert('Result', message, [
      {
        text: 'OK',
        onPress: () => {
          // Update score and level if both answers are correct
          if (correct1 && correct2) {
            if (level - 1 == completedLevels) {
              setCompletedLevels(completedLevels + 1);
            }
            setScore(score + 10);
            setNotification('Level Completed!');

            // Transition to the next screen after a brief delay
            setTimeout(() => {
              setNotification('');
              setShowLevelSelection(true);
              setShowGameScreen(false);
            }, 500);
          } else {
            // Show the message if either number is incorrect
            setNotification(message);
          }
        },
      },
    ]);
  };

  const home = () => {
    setShowLevelSelection(false);
    setShowGameScreen(false);
    restartGame();
  };

  const showResult = () => {
    setCanvasText([
      '___Answer___',
      '------------------------------',
      `  First number is: ${num1}   `,
      `  Second number is: ${num2}  `,
      '------------------------------',
    ]);
  };

  return (
    <View style={styles.container}>
      {showLevelSelection && (
        <View style={styles.levelSelection}>
          <TouchableOpacity
            style={[styles.btn, 1 > completedLevels + 1 && styles.locked]}
            onPress={() => startGame(1)}
            disabled={1 > completedLevels + 1}
          >
            <Text style={styles.btnText}>Level 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, 2 > completedLevels + 1 && styles.locked]}
            onPress={() => startGame(2)}
            disabled={2 > completedLevels + 1}
          >
            <Text style={styles.btnText}>Level 2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, 3 > completedLevels + 1 && styles.locked]}
            onPress={() => startGame(3)}
            disabled={3 > completedLevels + 1}
          >
            <Text style={styles.btnText}>Level 3</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, 4 > completedLevels + 1 && styles.locked]}
            onPress={() => startGame(4)}
            disabled={4 > completedLevels + 1}
          >
            <Text style={styles.btnText}>Level 4</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, 5 > completedLevels + 1 && styles.locked]}
            onPress={() => startGame(5)}
            disabled={5 > completedLevels + 1}
          >
            <Text style={styles.btnText}>Level 5</Text>
          </TouchableOpacity>
        </View>
      )}

      {!showLevelSelection && !showGameScreen && (
        <View>
          <Text style={styles.title}>Guess the number</Text>
          <TouchableOpacity style={styles.playbtn} onPress={() => setShowLevelSelection(true)}>
            <Text style={styles.btnplay}>Play</Text>
          </TouchableOpacity>
        </View>
      )}

      {showGameScreen && (
        <View>
          <View style={styles.navContainer}>
            <TouchableOpacity style={styles.btnhome} onPress={home}>
              <Text style={styles.btnText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnhome} onPress={restartGame}>
              <Text style={styles.btnText}>Reset</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Guess The Number</Text>
          <Text style={styles.scoreboard}>Level: {level} | Score: {score}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.btnstart} onPress={calculate}>
              <Text style={styles.btnText}>Start</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="1st No"
              keyboardType="numeric"
              value={input1}
              onChangeText={setInput1}
            />
            <TextInput
              style={styles.input}
              placeholder="2nd No"
              keyboardType="numeric"
              value={input2}
              onChangeText={setInput2}
            />
          </View>
          <View style={styles.checkContainer}>
            <TouchableOpacity style={styles.btncheck} onPress={check}>
              <Text style={styles.btnText}>Check</Text>
            </TouchableOpacity>
            <View style={styles.canvas}>
              {canvasText.map((text, index) => (
                <Text style={styles.canvastext} key={index}>
                  {text}
                </Text>
              ))}
            </View>
            <TouchableOpacity style={styles.btncheck} onPress={showResult}>
              <Text style={styles.btnText}>Show Answer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {notification !== '' && <Text style={styles.notification}>{notification}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(249, 255, 167)',
  },
  title: {
    fontSize: 36,
    color: 'lightbrown',
    fontWeight: 'bold',
    marginBottom: 10,
    bottom: 30,
    textAlign: 'center',
  },
  scoreboard: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 20,
    bottom: 40,
    color: 'rgb(0, 33, 95)',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'column',
    bottom: 50,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(0, 95, 0)',
    padding: 10,
    margin: 5,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  playbtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(245, 6, 38)',
    padding: 20,
    margin: 5,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    marginHorizontal: 70,
    cursor: 'auto',
  },
  btnplay: {
    color: 'rgb(248, 252, 250)',
    fontSize: 40,
    textAlign: 'center',
    marginLeft: 20,
  },
  btnhome: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'blue',
    padding: 10,
    margin: 5,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  btncheck: {
    backgroundColor: 'rgb(218, 73, 7)',
    padding: 10,
    margin: 5,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    marginHorizontal: 40,
  },
  btnstart: {
    backgroundColor: 'green',
    padding: 10,
    margin: 5,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    marginHorizontal: 40,
  },
  btnText: {
    color: 'rgb(248, 252, 250)',
    fontSize: 20,
    textAlign: 'center',
    marginLeft: 5,
  },
  locked: {
    backgroundColor: 'grey',
  },
  completed: {
    backgroundColor: 'rgb(0, 96, 0)',
  },
  inputContainer: {
    flexDirection: 'row',
    bottom: 40,
  },
  checkContainer: {
    bottom: 45,
  },
  input: {
    height: 40,
    width: 150,
    borderColor: 'rgb(53, 53, 53)',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgb(172, 172, 172)',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
    margin: 5,
    marginHorizontal: 10,
    color: 'black',
  },
  notification: {
    fontSize: 30,
    color: 'brown',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  levelSelection: {
    marginTop: 20,
  },
  canvas: {
    borderColor: 'grey',
    borderWidth: 1,
    width: 350,
    height: 200,
    fontFamily: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdd5b1',
    marginBottom: 20,
    fontSize: 30,
    textAlign: 'center',
  },
  canvastext: {
    fontSize: 25,
    textAlign: 'center',
    color: 'black',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    bottom: 30,
  },
});

export default App;
