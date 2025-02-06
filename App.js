import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


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
  const [showAnswerButton, setShowAnswerButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const levelsPerPage = 5;

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    loadGameState();
  }, []);

  useEffect(() => {
    restartGame();
  }, [level]);

  const saveData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving data', error);
    }
  };

  const loadData = async (key) => {
    try {
      const savedData = await AsyncStorage.getItem(key);
      return savedData !== null ? JSON.parse(savedData) : null;
    } catch (error) {
      console.error('Error loading data', error);
    }
  };

  const saveGameState = async () => {
    await saveData('level', level); // Save the current level
    await saveData('score', score); // Save the current score
    await saveData('completedLevels', completedLevels); // Save the number of completed levels
  };


  const loadGameState = async () => {
    const savedLevel = await loadData('level');
    const savedScore = await loadData('score');
    const savedCompletedLevels = await loadData('completedLevels');
    if (savedLevel !== null) setLevel(savedLevel);
    if (savedScore !== null) setScore(savedScore);
    if (savedCompletedLevels !== null) setCompletedLevels(savedCompletedLevels);
  };

  const restartGame = () => {
    let range;
    switch (level) {
      case 1:
        range = 10;
        break;
      case 2:
        range = 12;
        break;
      case 3:
        range = 14;
        break;
      case 4:
        range = 16;
        break;
      case 5:
        range = 18;
        break;
      case 6:
        range = 20;
        break;
      case 7:
        range = 22;
        break;
      case 8:
        range = 24;
        break;
      case 9:
        range = 26;
        break;
      case 10:
        range = 28;
        break;
      case 11:
        range = 30;
        break;
      case 12:
        range = 32;
        break;
      case 13:
        range = 34;
        break;
      case 14:
        range = 36;
        break;
      case 15:
        range = 36;
        break;
      default:
        range = 10;
    }
    setNum1(Math.floor(Math.random() * range + 1));
    setNum2(Math.floor(Math.random() * range + 1));
    setInput1('');
    setInput2('');
    let add = num1 + num2;
    let sub = num1 - num2;
    let mul = num1 * num2;
    let dv = num2 !== 0 ? num1 / num2 : 'Cannot divide by zero';
    let div = Math.floor(dv * 100) / 100;
    setCanvasText([
      '___Hint___',
      `Add(A + B) : ${add}`,
      `Sub(A - B) : ${sub}`,
      `Mul (A * B) : ${mul}`,
      `Div(A / B) : ${div}`
    ]);
    setShowAnswerButton(true);
  };

  const startGame = (lvl) => {
    // If the selected level is one level higher than completed levels, start the game for that level
    if (lvl <= completedLevels + 1) {
      let add = num1 + num2;
      let sub = num1 - num2;
      let mul = num1 * num2;
      let dv = num2 !== 0 ? num1 / num2 : 'Cannot divide by zero';
      let div = Math.floor(dv * 100) / 100;
      setCanvasText(['___Hint___', `Add(A + B) : ${add}`, `Sub(A - B) : ${sub}`, `Mul (A * B) : ${mul}`, `Div(A / B) : ${div}`]);
      setShowAnswerButton(true);
      setLevel(lvl);
      setShowLevelSelection(false);
      setShowGameScreen(true);
    } else {
      setModalMessage('Level is locked. Complete previous levels first.');
      setIsModalVisible(true);
    }
  };

  const check = () => {
    if (input1 === '' || input2 === '' || isNaN(input1) || isNaN(input2)) {
      setModalMessage('Please enter valid numbers.');
      setIsModalVisible(true);
      return;
    }

    let correct1 = parseInt(input1) === num1;
    let correct2 = parseInt(input2) === num2;

    let message = '';
    if (correct1) message += 'First number is correct\n';
    else message += 'First number is wrong!\n';

    if (correct2) message += 'Second number is correct\n ';
    else message += 'Second number is wrong!\n';

    if (correct1 && correct2) {
      setNotification('Level Completed!');
    } else {
      setNotification(message);
    }
    setModalMessage(message);
    setIsModalVisible(true);

    if (correct1 && correct2) {
      setCompletedLevels(completedLevels + 1); // Increment completed levels only if both answers are correct
      setScore(score + 10);
      saveGameState();  // Save the updated completed levels and score
      setTimeout(() => {
        setNotification('');
        setShowLevelSelection(true); // Show the level selection screen after completion
        setShowGameScreen(false); // Hide the game screen
      }, 200);
    }
  };


  const home = () => {
    setShowLevelSelection(false);
    setShowGameScreen(false);
    restartGame();
  };

  const showResult = () => {
    setCanvasText(['___Answer___',
      '-------------------',
      `A is : ${num1}`,
      `B is : ${num2}`,
      '--------------------']);

  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, Math.ceil(15 / levelsPerPage)));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const renderLevels = () => {
    const startIndex = (currentPage - 1) * levelsPerPage;
    const endIndex = startIndex + levelsPerPage;
    const levelsToShow = Array.from({ length: 15 }, (_, i) => i + 1).slice(startIndex, endIndex);

    return levelsToShow.map((lvl) => (
      <TouchableOpacity
        key={lvl}
        style={[styles.btn, lvl > completedLevels + 1 && styles.locked]}
        onPress={() => startGame(lvl)}
        disabled={lvl > completedLevels + 1}
      >
        <Text style={styles.lvltxt} >Level {lvl}</Text>
      </TouchableOpacity>
    ));
  };

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity style={styles.pageBtn} onPress={handlePreviousPage} disabled={currentPage === 1}>
        <Icon name="chevron-left" size={30} color="#4F8EF7" />
      </TouchableOpacity>
      <View style={styles.lvlcontainer}>
        {renderLevels()}
      </View>
      <TouchableOpacity style={styles.pageBtn} onPress={handleNextPage} disabled={currentPage === Math.ceil(15 / levelsPerPage)}>
        <Icon name="chevron-right" size={30} color="#4F8EF7" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Level Selection */}
      {showLevelSelection && (
        <View>
          <Text style={styles.lvltitxt}>Select LeveL</Text>
          <View style={styles.paginationContainer}>
            {renderPagination()}
          </View>
        </View>
      )}

      {/* Game Screen */}
      {!showLevelSelection && !showGameScreen && (
        <View style={styles.first}>
          <Image style={styles.firstimage} source={require('./image/logo.png')} />
          <Text style={styles.txt}>GuessTheNumber</Text>
          <TouchableOpacity style={styles.button} onPress={() => setShowLevelSelection(true)}>
            <Text style={styles.playtxt}>Play</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game Screen */}
      {showGameScreen && (
        <View style={styles.gamecontainer}>
          <View style={styles.navbar}>
            <TouchableOpacity style={styles.navbtn} onPress={home}>
              <Text style={styles.navtxt}>Home</Text>
            </TouchableOpacity>
            <Image source={require('./image/logo.png')} style={styles.image} />
            <TouchableOpacity style={styles.navbtn} onPress={restartGame}>
              <Text style={styles.navtxt}>Reset</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.titlecontainer}>
            <Text style={styles.titxt}>Guess The Numbers</Text>
            <Text style={styles.titxt}>Level: {level} | Score: {score}</Text>
          </View>
          <View style={styles.canvacontainer}>
            <View style={styles.canvas}>
              {canvasText.map((text, index) => (
                <Text style={styles.cantxt} key={index}>{text}</Text>
              ))}
            </View>
            <View style={styles.inputcontainer}>
              <TextInput
                style={styles.inputtxt}
                placeholder="A:num"
                keyboardType="numeric"
                value={input1}
                onChangeText={setInput1}
              />
              <TextInput
                style={styles.inputtxt}
                placeholder="B:num"
                keyboardType="numeric"
                value={input2}
                onChangeText={setInput2}
              />
            </View>
            <View style={styles.checkcontainer}>
              <TouchableOpacity style={styles.checkbtn} onPress={check}>
                <Text style={styles.checktxt}>Check Numbers</Text>
              </TouchableOpacity>
              {showAnswerButton && (
                <TouchableOpacity style={styles.checkbtn} onPress={showResult}>
                  <Text style={styles.checktxt}>Show Answer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
      {/* Modal for showing feedback */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{modalMessage} {notification}</Text>
            <View style={styles.iconBtn}>
              <TouchableOpacity style={styles.tryBtn} onPress={() => {
                setIsModalVisible(false);
                restartGame();
              }}>
                <Icon name="refresh" size={30} color="#4F8EF7" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setIsModalVisible(false)}>
                <Icon name="close" size={30} color="#4F8EF7" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

//stylesheet 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderColor: 'rgba(23, 113, 197, 0.75)',
    maxWidth: wp('100%'),
    maxHeight: hp('90%'),
  },
  first: {
    justifyContent: 'center',
    alignItems: 'center',
    height: hp('80%'),
    bottom: wp('10%'),
  },
  firstimage: {
    maxWidth: wp('100%'),
    maxHeight: hp('30%'),
    resizeMode: 'contain',
  },
  txt: {
    maxWidth: wp('100%'),
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: 'black',
    margin: wp('2%'),
  },
  button: {
    backgroundColor: 'rgba(130, 168, 202, 0.75)',
    padding: wp('3%'),
    borderRadius: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: wp('0.4%'),
    shadowRadius: wp('3%'),
    borderColor: 'rgba(10, 127, 236, 0.75)',
    borderWidth: wp('1%'),
  },
  playtxt: {
    color: 'black',
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  lvlcontainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: wp('100%'),
    margin: wp('10')
    // borderWidth: 3,
  },
  lvltitxt: {
    fontSize: wp('7%'),
    fontWeight: 'normal',
    color: 'rgba(10, 127, 236, 0.99)',
    margin: wp('1%'),
    textAlign: 'center',
    top: hp('5%'),
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 2,
    maxWidth: wp('100%'),

  },
  pageBtn: {
    padding: 10,
    margin: 5,
    borderRadius: 5,

  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: wp('45%'),
    backgroundColor: 'rgb(168, 184, 202)',
    borderWidth: wp('1%'),
    borderColor: 'rgba(10, 127, 236, 0.75)',
    padding: wp('2%'),
    margin: wp('1%'),
    borderRadius: '25%',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  lvltxt: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: 'black',
  },
  locked: {
    backgroundColor: 'gray',
  },
  notification: {
    fontSize: 24,
    color: 'red',
    top: 15,
  },

  gamecontainer: {
    maxWidth: wp('95%'),
    maxHeight: hp('90%'),
  },
  navbar: {
    padding: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 3,
    maxHeight: hp('20%'),
  },
  navbtn: {
    backgroundColor: 'rgb(168, 184, 202)',
    padding: wp('2%'),
    borderRadius: wp('3%'),
    borderWidth: wp('1%'),
    borderColor: 'rgba(10, 127, 236, 0.75)',
  },
  navtxt: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: 'black',
  },
  titlecontainer: {
    maxwidth: wp('100%'),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    //top: 2,
  },
  titxt: {
    fontSize: wp('6%'),
    fontWeight: 'bold'
  },

  canvacontainer: {
    maxWidth: wp('100%'),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    //top: 5,
   
  },
  canvas: {
    maxWidth: wp('100%'),
    maxHeight: hp('50%'),
    backgroundColor: 'rgba(204, 223, 240, 0.88)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    marginBottom: 20,
  },
  txtbot: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  cantxt: {
    fontSize: wp('6%'),
    color: 'black',
    fontWeight: 'bold',
  },
  inputcontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    //aspectRatio: 3,
    maxwidth: wp('100%'),
  },
  inputtxt: {
    //maxWidth: wp('100%'),
    maxHeight: hp('10%'),
    borderColor: 'rgba(10, 127, 236, 0.75)',
    borderWidth: wp('2%'),
    borderRadius: wp('2%'),
    margin: wp('1%'),
    padding: wp('2%'),
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  checkbtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(233, 224, 206, 0.75)',
    borderRadius: 10,
    margin: 5,
    borderWidth: wp('1%'),
    borderColor: 'rgba(236, 100, 10, 0.86)',

  },
  checktxt: {
    fontSize: wp('7%'),
  },

  image: {
    maxHeight: hp('10%'),
    maxWidth: wp('20%'),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: wp('80%'),
    padding: 20,
    backgroundColor: 'rgba(204, 223, 240, 0.88)',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalMessage: {
    justifyContent: 'center',
    alignItems: 'center',

    fontSize: wp('6%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp('60%'),
  },
  closeBtn: {
    marginTop: 20,
    padding: 5,
    backgroundColor: 'rgba(204, 223, 240, 0.88)',
    borderWidth: 4,
    borderColor: 'rgba(10, 127, 236, 0.75)',
    borderRadius: 5,
    paddingEnd: 10,
  },

  tryBtn: {
    marginTop: 20,
    padding: 5,
    backgroundColor: 'rgba(204, 223, 240, 0.88)',
    borderWidth: 4,
    borderColor: 'rgba(10, 127, 236, 0.75)',
    borderRadius: 5,
  },


});


export default App;


