import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, Image, TextInput, TouchableOpacity, StyleSheet, Modal, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useRef } from 'react';

const App = () => {
  const [level, setLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState(0);
  const [score, setScore] = useState(0);
  const [num1, setNum1] = useState(null);
  const [num2, setNum2] = useState(null);
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [inputASelected, setInputASelected] = useState(false);
  const [inputBSelected, setInputBSelected] = useState(false);
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [coins, setCoins] = useState(100); // Start with 100 or load from AsyncStorage
  const [showConfetti, setShowConfetti] = useState(false);
  // const [focusedLevel, setFocusedLevel] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0); // <-- ADD THIS
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHintModalVisible, setIsHintModalVisible] = useState(false);


  const animateFocus = () => {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 120,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animated style for scaling effect
  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };


  useEffect(() => {
    loadGameState();
  }, [loadGameState]);

  useEffect(() => {
    restartGame();
  }, [level, restartGame]);

  const winMessages = [
    'Great! 🎉',
    'Awesome! 😎',
    'Well done! 👏',
    'Correct! ✅',
    'Nice work! 👍',
    'Brilliant! 💡',
    "You're on fire! 🔥",
    'Keep it up! 🚀',
    'Excellent! 🌟',
    'Super smart! 🧠',
  ];
  const wrongMessages = [
    'Oops! Try again! 😅',
    'Not quite! 😬',
    "Almost! Don't give up! 💪",
    "Don't worry",
  ];

  const saveData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      await saveData('coins', coins);
      setCoins(value); // Update coins state
    } catch (error) {
      console.error('Error saving data', error);
    }
  };

  const loadData = useCallback(async (key) => {
    try {
      const savedData = await AsyncStorage.getItem(key);
      const savedCoins = await loadData('coins');
      if (savedCoins !== null) { setCoins(savedCoins); }
      return savedData !== null ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error('Error loading data', error);
    }
  }, []);

  const saveGameState = async () => {
    await saveData('level', level);
    await saveData('score', score);
    await saveData('completedLevels', completedLevels);
  };

  const loadGameState = useCallback(async () => {
    const savedLevel = await loadData('level');
    const savedScore = await loadData('score');
    const savedCompletedLevels = await loadData('completedLevels');
    if (savedLevel !== null) { setLevel(savedLevel); }
    if (savedScore !== null) { setScore(savedScore); }
    if (savedCompletedLevels !== null) { setCompletedLevels(savedCompletedLevels); }
  }, [loadData]);

  const restartGame = useCallback(() => {
    const range = Math.min(5 + (level) * 2, 100);
    setNum1(Math.floor(Math.random() * range + 1));
    setNum2(Math.floor(Math.random() * range + 1));
    setInput1('');
    setInput2('');
    setQuestionNumber(0); // <-- ADD THIS
  }, [level]);

  const startGame = (lvl) => {
    if (lvl === 1 || lvl <= completedLevels + 1) {
      // setFocusedLevel(lvl);
      animateFocus();
      setLevel(lvl);
      setShowLevelSelection(false);
      setShowGameScreen(true);
      setQuestionNumber(0); // <-- ADD THIS
    } else {
      setModalMessage('Level is locked. Complete previous levels.');
      setIsModalVisible(true);
    }
  };

  const nextQuestion = () => {
    if (questionNumber < 4) {
      setQuestionNumber(questionNumber + 1);
      const range = Math.min(5 + (level) * 2, 100);
      setNum1(Math.floor(Math.random() * range + 1));
      setNum2(Math.floor(Math.random() * range + 1));
      setInput1('');
      setInput2('');
    } else {

      // Finished 5 questions, move to next level
      setLevel(level + 1);
      setQuestionNumber(0);
      setShowLevelSelection(true);
      setShowGameScreen(false);
    }
  };

  const check = () => {
    const wrong = wrongMessages[Math.floor(Math.random() * wrongMessages.length)];

    // Check for empty or invalid input
    if (input1 === '' || input2 === '' || isNaN(input1) || isNaN(input2)) {
      setModalMessage(`${wrong}\nPls enter valid numbers`);
      setIsModalVisible(true);
      return;
    }

    const correct1 = parseInt(input1, 10) === num1;
    const correct2 = parseInt(input2, 10) === num2;

    // ❗ If this is the first question and the answer is wrong
    if (questionNumber === 0 && (!correct1 || !correct2)) {
      setModalMessage('Oops! Try again! 😅');
      setIsModalVisible(true);
      return;
    }

    let message = '';
    message += correct1 ? 'A is correct\n' : 'A is wrong!\n';
    message += correct2 ? 'B is correct\n' : 'B is wrong!\n';

    const randomMessage = winMessages[Math.floor(Math.random() * winMessages.length)];

    // Only show earned coins if both answers are correct
    if (correct1 && correct2) {
      setModalMessage(message + ' ' + randomMessage + '\nYou earned 10🪙');
      setIsModalVisible(true);
      setShowConfetti(true);

      // Award 50🪙 if final question in new level
      if (level - 1 === completedLevels && questionNumber === 4) {
        setCompletedLevels(prev => prev + 1);
        setCoins(prev => {
          const newCoins = prev + 50;
          saveData('coins', newCoins);
          return newCoins;
        });
        setModalMessage(prev => prev + `\n🎉 Lvl${level} complete! You earned 50🪙!`);
      }

      // Always award 10🪙 for correct answer
      setCoins(prev => {
        const newCoins = prev + 10;
        saveData('coins', newCoins);
        return newCoins;
      });

      setScore(prev => prev + 10);
      saveGameState();

      setTimeout(() => {
        nextQuestion();
      }, 500);
    } else {
      // Answer is wrong, but not first question
      setModalMessage(message + '\n' + wrong);
      setIsModalVisible(true);
    }
  };


  const home = () => {
    setShowLevelSelection(false);
    setShowGameScreen(false);
    restartGame();
  };

  const renderLevels = () => {
    const levelsToShow = Array.from({ length: 50 }, (_, i) => i + 1);
    return (
      <View style={styles.levelsContainer}>
        {levelsToShow.map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.btn, lvl > completedLevels + 1 && styles.locked]}
            onPress={() => startGame(lvl)}
            disabled={lvl > completedLevels + 1}
          >
            <Animated.View style={[styles.levelBtnContent, animatedStyle]}>
              <Text style={styles.lvltxt}>{lvl}</Text>
              {lvl <= completedLevels && <Text style={styles.starText}>⭐</Text>}
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };


  return (
    <View style={styles.container}>
      {/* Level Selection Screen */}
      {showLevelSelection && (
        <View>
          <Text style={styles.title}>🧠 Select a Level</Text>
          <Text style={styles.subtitle}>Unlock levels by completing them one by one!</Text>
          <View style={styles.levelsContainer}>
            {renderLevels()}
          </View>
        </View>
      )}
      {/* Home Screen */}
      {!showLevelSelection && !showGameScreen && (
        <View style={styles.homeScreen}>
          <Image style={styles.firstimage} source={require('./image/logo.png')} />
          <View style={styles.centered}>
            <Text style={styles.title}>🧠 Welcome to the Math Game!</Text>
            <Text style={styles.subtitle}>Test your math skills step by step!</Text>
            <TouchableOpacity onPress={() => setShowLevelSelection(true)} style={styles.submitBtn}>
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Game Screen */}
      {showGameScreen && (
        <View style={styles.gamecontainer}>
          <View style={styles.headerRow}>
               <TouchableOpacity onPress={home}>
            <Image source={require('./image/home.png')} style={styles.image} />
          </TouchableOpacity>
            <Text style={styles.header}>&nbsp;&nbsp;Math Game&nbsp; 🧠:&nbsp;&nbsp;&nbsp;&nbsp;<Text style={styles.levelNumber}>{level}</Text>&nbsp;&nbsp;</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.infoText}>Lvl: <Text>{level}</Text></Text>
              <Text style={styles.infoText}>🪙<Text>{coins}</Text></Text>
              <TouchableOpacity onPress={() => setIsHintModalVisible(true)}>
                <Text style={styles.infoText}>💡Hint</Text>
              </TouchableOpacity>
            </View>
            <Modal
              animationType="fade"
              transparent={true}
              visible={isHintModalVisible}
              onRequestClose={() => setIsHintModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalMessage}>Choose a hint:</Text>

                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => {
                      if (coins >= 20) {
                        const newCoins = coins - 20;
                        setCoins(newCoins);
                        saveData('coins', newCoins);
                        setInput1(num1.toString());
                        setInputASelected(false);
                        setIsHintModalVisible(false);
                      } else {
                        setIsHintModalVisible(false);
                        setModalMessage('Not enough coins for Hint A!');
                        setIsModalVisible(true);
                      }
                    }}
                  >
                    <Text style={styles.okstyle}>Hint A (-20🪙)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.closeBtn, styles.hintBtn]}
                    onPress={() => {
                      if (coins >= 20) {
                        const newCoins = coins - 20;
                        setCoins(newCoins);
                        saveData('coins', newCoins);
                        setInput2(num2.toString());
                        setInputBSelected(false);
                        setIsHintModalVisible(false);
                      } else {
                        setIsHintModalVisible(false);
                        setModalMessage('Not enough coins for Hint B!');
                        setIsModalVisible(true);
                      }
                    }}
                  >
                    <Text style={styles.okstyle}>Hint B (-20🪙)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setIsHintModalVisible(false)}
                    style={[styles.closeBtn, styles.cancelBtn]}
                  >
                    <Text style={styles.okstyle}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View >
              <View style={styles.procontainer}>
                <View style={[styles.probar, { width: `${((questionNumber) / 5) * 100}%` }]} />
              </View>
              <Text style={styles.questionCounter}>
                Question {questionNumber + 1} / 5
              </Text>
            </View>
          </View>
          {/*  Input fields for A and B */}
          <View style={styles.inputRow}>
            <Text style={styles.label}>A:</Text>
            <TextInput
              style={[styles.input, inputASelected && styles.inputSelected]}
              keyboardType="numeric"
              value={input1}
              onFocus={() => {
                setInputASelected(true);
                setInputBSelected(false);
              }}
              onChangeText={setInput1}
              placeholder="A"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.label}>B:</Text>
            <TextInput
              style={[styles.input, inputBSelected && styles.inputSelected]}
              keyboardType="numeric"
              value={input2}
              onFocus={() => {
                setInputBSelected(true);
                setInputASelected(false);
              }}
              onChangeText={setInput2}
              placeholder="B"
            />
          </View>
          {/* Submit button */}
          <TouchableOpacity style={styles.checkBtn} onPress={check}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
          <View style={styles.card}>
            <Text style={styles.rangeText}>lvl:{level}&nbsp;&nbsp;Range: 1 to {10 + (level - 1) * 5}</Text>
            <Text style={styles.question}><Text style={styles.label}>Add (A + B):</Text> {num1 + num2}</Text>
            <Text style={styles.question}><Text style={styles.label}>Sub (A - B):</Text> {num1 - num2}</Text>
            <Text style={styles.question}><Text style={styles.label}>Mul (A × B):</Text> {num1 * num2}</Text>
            <Text style={styles.question}>
              <Text style={styles.label}>Div (A ÷ B):</Text> {num2 === 0 ? 'Undefined' : (num1 / num2).toFixed(1)}
            </Text>
          </View>

        </View>
      )}
      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.okstyle}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {showConfetti && (
        <ConfettiCannon
          count={100}
          origin={{ x: -10, y: 0 }}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
    </View>

  );
};

const styles = StyleSheet.create({
  firstimage: {
    width: wp('50%'),
    height: hp('25%'),
    resizeMode: 'contain',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: wp('2%'),
  },
  homeScreen: {
    width: '90%',
    maxWidth: 500,
    alignSelf: 'center',
    alignItems: 'center',
  },
  centered: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: wp('5%'),
    padding: wp('5%'),
  },
  title: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: wp('4.2%'),
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: hp('2%'),
  },
  submitBtn: {
    width: '100%',
    padding: hp('2%'),
    borderRadius: wp('3%'),
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    marginTop: hp('1.5%'),
  },
  buttonText: {
    color: 'white',
    fontSize: wp('6%'),
    fontWeight: '700',
  },
  btn: {
    margin: wp('1.2%'),
    padding: wp('2.5%'),
    width: wp('14%'),
    height: wp('14%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp('3%'),
    backgroundColor: '#4f46e5',
  },
  locked: {
    backgroundColor: '#94a3b8',
    opacity: 0.5,
  },
  lvltxt: {
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
    color: '#fff',
  },
  levelNumber: {
    fontSize: wp('10%'),
    fontWeight: 'bold',
    color: '#facc15',
  },
  gamecontainer: {
    width: wp('95%'),
    alignSelf: 'center',
    marginBottom: hp('2%'),
  },
  image: {
    height: hp('6%'),
    width: wp('12%'),
    resizeMode: 'contain',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: wp('3%'),
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: wp('5%'),
    color: '#f8fafc',
    fontWeight: '500',
  },
  procontainer: {
    height: hp('1.5%'),
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: wp('1%'),
    overflow: 'hidden',
    marginVertical: hp('1%'),
  },
  probar: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  questionCounter: {
    color: '#fff',
    fontSize: wp('5%'),
    textAlign: 'center',
  },
  rangeText: {
    color: '#fff',
    fontSize: wp('4.8%'),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: hp('1%'),
    backgroundColor: '#1e293b',
  },
  question: {
    color: '#f8fafc',
    fontSize: wp('6%'),
    marginVertical: hp('0.5%'),
    textAlign: 'center',
  },
  label: {
    fontWeight: 'italic',
    fontSize: wp('6%'),
    color: '#facc15',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('1%'),
    width: '100%',
    paddingHorizontal: wp('4%'),
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#475569',
    borderRadius: wp('3%'),
    fontSize: wp('6%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#1e293b',
    marginLeft: wp('2%'),
    color: '#f8fafc',
    fontWeight: 'bold',
  },
  inputSelected: {
    backgroundColor: '#d1fae5',
    color: '#000',
  },
  checkBtn: {
    backgroundColor: '#4f46e5',
    padding: hp('2%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
    marginTop: hp('1%'),
    marginBottom: hp('2%'),
    width: '90%',
    alignSelf: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: wp('6%'),
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: wp('85%'),
    padding: wp('4%'),
    backgroundColor: 'skyblue',
    borderRadius: wp('3%'),
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  closeBtn: {
    padding: hp('1.5%'),
    backgroundColor: '#4f46e5',
    borderRadius: wp('2.5%'),
    marginVertical: hp('0.5%'),
    width: '90%',
    alignItems: 'center',
  },
  okstyle: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cancelBtn: {
    marginTop: hp('2%'),
    backgroundColor: 'gray',
  },
  hintBtn: {
    marginTop: hp('1%'),
  },
  levelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: hp('1%'),
  },
});


export default App;
