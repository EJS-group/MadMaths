import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import { ThemedButton } from "react-native-really-awesome-button";

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
  // Removed unused notification state
  const [canvasText, setCanvasText] = useState([]);
  const [showStartButton, setShowStartButton] = useState(true);
  const [showAnswerButton, setShowAnswerButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const levelsPerPage = 5;

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    loadGameState();
  }, [loadGameState]);

  useEffect(() => {
    restartGame();
  }, [level, restartGame]);

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
    await saveData('level', level);
    await saveData('score', score);
    await saveData('completedLevels', completedLevels);
  };

  const loadGameState = React.useCallback(async () => {
    const savedLevel = await loadData('level');
    const savedScore = await loadData('score');
    const savedCompletedLevels = await loadData('completedLevels');
    if (savedLevel !== null) { setLevel(savedLevel); }
    if (savedScore !== null) { setScore(savedScore); }
    if (savedCompletedLevels !== null) { setCompletedLevels(savedCompletedLevels); }
  }, []);

  const restartGame = React.useCallback(() => {
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
        range = 34;
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
    setCanvasText([]);
    setShowStartButton(true);
    setShowAnswerButton(false);
  }, [level]);

  const startGame = (lvl) => {
    if ((lvl === 1) || (lvl <= completedLevels + 1)) {
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

    setCanvasText(['___Hint___', `Add(A + B) : ${add}`, `Sub(A - B) : ${sub}`, `Mul (A * B) : ${mul}`, `Div(A / B) : ${div}`]);
    setShowStartButton(false);
    setShowAnswerButton(true);
  };

  const check = () => {
    if (input1 === '' || input2 === '' || isNaN(input1) || isNaN(input2)) {
      setModalMessage('Please enter valid numbers.');
      setIsModalVisible(true);
      return;
    }

    let correct1 = parseInt(input1, 10) === num1;
    let correct2 = parseInt(input2, 10) === num2;

    let message = '';
    if (correct1) { message += 'First number is correct\n'; }
    else { message += 'First number is wrong!\n'; }

    if (correct2) { message += 'Second number is correct\n'; }
    else { message += 'Second number is wrong!\n'; }

    // if (correct1 && correct2) {
    //   // setNotification('Level Completed!'); // Removed undefined function
    // } else {
    //   // setNotification(message); // Removed undefined function
    // }

    setModalMessage(message);
    setIsModalVisible(true);

    if (correct1 && correct2) {
      if (level - 1 === completedLevels) {
        setCompletedLevels(completedLevels + 1);
      }
      setScore(score + 10);
      saveGameState();
      setTimeout(() => {
        setShowLevelSelection(true);
        setShowGameScreen(false);
      }, 200);
    }
  };

  const home = () => {
    setShowLevelSelection(false);
    setShowGameScreen(false);
    restartGame();
  };

  const showResult = () => {
    setCanvasText(['___Answer___', '-------------------', `A is : ${num1}`, `B is : ${num2}`, '--------------------']);
    setShowStartButton(false);
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
        <Text style={styles.lvltxt}>Level {lvl}</Text>
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
          <Text style={styles.lvltitxt}>Select The Levels</Text>
          <LinearGradient
            colors={['#FFFFB5', '#247BA0', '#70C1B3']}
            useAngle={true} angle={120}
            angleCenter={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.paginationContainer}>
              {renderPagination()}
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Game Screen */}
      {!showLevelSelection && !showGameScreen && (
        <View style={styles.first}>
          <Image style={styles.firstimage} source={require('./image/logo.png')} />
          <Text style={styles.txt}>GuessTheNumber</Text>
          {/* <TouchableOpacity style={styles.button} onPress={() => setShowLevelSelection(true)}>
            <Text style={styles.playtxt}>Play</Text>
          </TouchableOpacity> */}
         <ThemedButton name="bruce" type="secondary" style={styles.button} onPress={() => setShowLevelSelection(true)}>
          <Text style={styles.playtxt}>Play</Text></ThemedButton>
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
            <Text style={styles.sctxt}>Level: {level} | Score: {score}</Text>
          </View>
          <View style={styles.canvacontainer}>
            <View style={styles.canvas}>
              <View style={styles.txtbot}>
                {showStartButton && (
                  <TouchableOpacity onPress={calculate}>
                    <Icon name="play-circle" size={60} color="#4F8EF7" />
                  </TouchableOpacity>
                )}
              </View>
              {canvasText.map((text, index) => (
                <Text style={styles.cantxt} key={index}>{text}</Text>
              ))}
            </View>

            {showAnswerButton && (
              <View>
                <View style={styles.inputcontainer}>
                  <Text style={styles.intext}>A:</Text>
                  <TextInput
                    style={styles.inputtxt}
                    placeholder="A:num"
                    keyboardType="numeric"
                    value={input1}
                    onChangeText={setInput1}
                  />
                  <Text style={styles.intext}>B:</Text>
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
                  <TouchableOpacity style={styles.checkbtn} onPress={showResult}>
                    <Text style={styles.checktxt}>Show Answers</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

      )}
      {/* Modal for showing feedback */}

      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.okstyle}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

//stylesheet
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderColor: 'rgba(23, 113, 197, 0.75)',
  },
  first: {
    justifyContent: 'center',
    alignItems: 'center',
    height: hp('80%'),
    bottom: wp('10%'),
  },
  firstimage: {
    maxWidth: wp('50%'),
    maxHeight: hp('25%'),
    resizeMode: 'contain',
  },
  txt: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: 'black',
    margin: wp('2%'),
  },
  // button: {
  //   // backgroundColor: 'rgba(130, 168, 202, 0.75)',
  //   // padding: wp('3%'),
  //   // borderRadius: wp('4%'),
  //   // shadowColor: '#000',
  //   // shadowOffset: { width: 2, height: 2 },
  //   // shadowOpacity: wp('0.4%'),
  //   // shadowRadius: wp('3%'),
  //   // borderColor: 'rgba(10, 127, 236, 0.75)',
  //   // borderWidth: wp('1%'),

  // },
  playtxt: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: 'rgb(206, 100, 51)', 
  },
  lvlcontainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: wp('100%'),
    margin: wp('10'),
    // borderWidth: 3,
  },
  lvltitxt: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: 'black',
    margin: wp('1%'),
    textAlign: 'center',
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
    maxWidth: wp('50%'),
    backgroundColor: 'rgb(230, 238, 235)',
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
    backgroundColor: 'rgba(15, 236, 218, 0.5)',
  },
  notification: {
    fontSize: 24,
    color: 'red',
    top: 15,
  },

  gamecontainer: {
    maxWidth: wp('95%'),
    maxHeight: hp('80%'),
    bottom: 20,
  },
  navbar: {
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 5,
    maxHeight: hp('10%'),
  },
  navbtn: {
    backgroundColor: 'rgb(168, 184, 202)',
    padding: wp('2%'),
    borderRadius: wp('3%'),
    borderWidth: wp('1%'),
    borderColor: 'rgba(10, 127, 236, 0.75)',
  },
  navtxt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  titlecontainer: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    top: 5,
  },
  titxt: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
  },
  sctxt: {
    fontSize: wp('5%'),
    fontWeight: 'bold',

  },
  //canva style
  canvacontainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    top: 20,
  },
  canvas: {
    maxWidth: wp('100%'),
    maxHeight: hp('40%'),
    backgroundColor: 'rgba(204, 223, 240, 0.88)',
    borderRadius: 10,
    borderWidth: wp('.5%'),
    borderColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 8,
  },
  txtbot: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    //marginBottom: 5,
  },
  /*
  startbtn: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 10,
  },
  starttxt: {
    color: 'black',
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  */
  cantxt: {
    fontSize: wp('5%'),
    color: 'black',
    marginBottom: 5,
    fontWeight: 'bold',
  },

  //input style
  inputcontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intext: {
    fontSize: hp('3%'),
    fontWeight: 'bold',
    justifyContent: 'center',
    verticalAlign: 'middle',
  },
  inputtxt: {
    width: wp('25%'),
    borderColor: 'rgba(10, 127, 236, 0.75)',
    borderWidth: wp('2%'),
    borderRadius: wp('2%'),
    margin: 3,
    //padding: 6,
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  //check and show button style
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
    fontWeight: 'bold',
  },

  image: {
    maxHeight: hp('10%'),
    maxWidth: wp('20%'),
  },

  //model containner style
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: wp('90%'),
    padding: 18,
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
  closeBtn: {
    marginTop: 20,
    padding: 5,
    backgroundColor: 'rgba(181, 214, 243, 0.88)',
    borderWidth: 4,
    borderColor: 'rgba(29, 25, 25, 0.36)',
    borderRadius: 5,
    left: 110,
  },
  okstyle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
export default App;
