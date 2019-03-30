var { Panel, Character, Balloon, Strip } = Komik;
var imgUrl = 'https://sonny.js.org/react-komik/dist/';

let config = {
  "theme": [
  "lang_study",
  "going_to"],

  "lang_study_question": [
  "#place#에서 #langvar1#를 공부합니까?"],

  "lang_study_negation": [
  "아니오, #langvar1#를 공부하지 않습니다."],

  "lang_study_answer": [
  "저는 #place#에서 일본어를 공부합니다"],

  "going_to_question": [
  "#placevar1#에 갑니까?"],

  "going_to_negation": [
  "아니오, #placevar1#에 가지 않습니다."],

  "going_to_answer": [
  "저는 #place#에 깁니다"],

  "lang1": [
  "한국어",
  "영어",
  "브라질어"],

  "lang2": [
  "독일어",
  "일본어"],

  "place": [
  "한국",
  "대학교",
  "서울대학교"] };



var loadGitHubScript = url => fetch(url).
then(res => res.blob()).
then(body => loadScript(URL.createObjectURL(body)));

var loadScript = url => new Promise(function (resolve, reject) {
  var script = document.createElement('script');
  script.src = url;
  script.onload = resolve;
  script.onerror = reject; // TODO Not sure it really works
  document.head.appendChild(script);
});

loadGitHubScript(`https://raw.githubusercontent.com/galaxykate/tracery/tracery2/js/tracery/tracery.js`).
then(() => loadGitHubScript(`https://raw.githubusercontent.com/galaxykate/tracery/tracery2/js/tracery/mods-eng-basic.js`)).
then(() => {
  function generateComicsDialog() {
    let grammar = tracery.createGrammar(config);
    grammar.addModifiers(baseEngModifiers);
    grammar.pushRules('dialog_theme', grammar.flatten("#theme#"));
    grammar.pushRules('langvar1', grammar.flatten("#lang1#"));
    grammar.pushRules('placevar1', grammar.flatten("#place#"));


    // let names = [];
    // for (var i = 0; i < (~~(Math.random() * 8) + 2); i++) {
    //   let newValue = grammar.flatten("#origin#")
    //   names.push(newValue);
    // }
    let dialog_theme = grammar.flatten("#dialog_theme#");
    let question_text = grammar.flatten("#" + dialog_theme + "_question#");
    let question_negation = grammar.flatten("#" + dialog_theme + "_negation#");
    let question_answer = grammar.flatten("#" + dialog_theme + "_answer#");

    generateComics(question_text, question_negation, question_answer);
  }

  generateComicsDialog();

  // $("#comics-button").on('click', generateComicsDialog);
});

function generateComics(dialog_text1, dialog_text2, dialog_text3)
{
  let Comic = (props) =>
  React.createElement(Strip, { title: "\uD55C\uAD6D\uC5B4", column: "2", fontFamily: "Patrick Hand", fontSize: "16", upperCase: false },
  React.createElement(Panel, null,
  React.createElement(Character, {
    image: imgUrl + 'char1.png',
    left: "70",
    scale: "0.65" },
  React.createElement(Balloon, {
    left: "-80",
    height: "120",
    image: imgUrl + 'chat_left.svg',
    text: dialog_text1 }))),



  React.createElement(Panel, null,
  React.createElement(Character, {
    image: imgUrl + 'char2.png',
    left: "30",
    scale: "0.65" },
  React.createElement(Balloon, {
    height: "160",
    left: "60",
    bottom: "-110",
    image: imgUrl + 'chat_right.svg',
    text: dialog_text2 }))),


    React.createElement(Panel, null,
  React.createElement(Character, {
    image: imgUrl + 'char2.png',
    left: "30",
    scale: "0.65" },
  React.createElement(Balloon, {
    height: "160",
    left: "60",
    bottom: "-110",
    image: imgUrl + 'chat_right.svg',
    text: dialog_text3 }))),



  React.createElement(Character, { image: imgUrl + 'footer.png', align: "center", bottom: "20", scale: "0.8" }));



  ReactDOM.render(React.createElement(Comic, null), document.getElementById('root'));
}