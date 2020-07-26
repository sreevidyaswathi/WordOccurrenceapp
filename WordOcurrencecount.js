const url1 = "http://norvig.com/big.txt ";
const url2 =
  "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf&lang=en-en&text=";

const got = require("got");

/*func to fetch the data from url1 and to look up the disctionary api for synonym and Parts Of Speech*/
getdata = async (url1, url2) => {
  try {
    const response = await got(url1);
    data = await response.body;
    ArrayOfwords = splitByWords(data);
    WordMap = createWordMap(ArrayOfwords);
    Finalarray = FinalWordmap(WordMap);
    //Array of odjects having word and word count
    //console.log(Finalarray);
    let resultfromAPI = [];
    for (i = 0; i < Finalarray.length; i++) {
      var res = await got(url2 + Finalarray[i]["Word"]);
      s = JSON.parse(res.body);
      if (!s.def[0]) {
        obj = {
          text: "",
          pos: "",
        };
        resultfromAPI.push(obj);
      } else if (!s.def[0].tr[0].syn) {
        obj = {
          text: "",
          pos: "",
        };
        obj.pos = s.def[0].pos;
        obj.text = s.def[0].text;
        resultfromAPI.push(obj);
      } else {
        resultfromAPI.push(s.def[0].tr[0].syn[0]);
      }
    }
    //Array of synonyms,parts of speech for each of top 10 words
    // console.log(resultfromAPI);

    jsonLIST = [];

    Finalarray.forEach((obj, index) => {
      finalobj = {
        Word: "",
        output: {
          Count: 0,
          syn: "",
          pos: "",
        },
      };
      Object.keys(obj).forEach((key) => {
        if (key == "Word") finalobj[key] = obj[key];
        if (key == "Count") finalobj["output"][key] = obj[key];
      });
      resultfromAPI.forEach((ele, eleindex) => {
        if (index == eleindex) {
          Object.keys(ele).forEach((key) => {
            if (key == "text") finalobj["output"]["syn"] = ele[key];
            if (key == "pos") finalobj["output"]["pos"] = ele[key];
          });
        }
      });

      jsonLIST.push(finalobj);
    });
    //Final output array of JSON
    console.log(jsonLIST);
  } catch (error) {
    console.log(error.response.body);
  }
};

getdata(url1, url2);

function splitByWords(text) {
  // split string by spaces (including spaces, tabs, and newlines)
  var wordsArray = text.split(/\s+/);
  return wordsArray;
  /*
wordsarray=["Hey","this","is", "the","word","count","of","this","word"]
*/
}

function createWordMap(wordsArray) {
  var wordsMap = {};
  wordsArray.forEach((key) => {
    if (wordsMap.hasOwnProperty(key)) {
      wordsMap[key]++;
    } else {
      wordsMap[key] = 1;
    }
  });

  return wordsMap;
  /*
WordsMap = {
"Hey":1,
"this":2,
"word":2
}
*/
}

function FinalWordmap(Wordmap) {
  /*
    finalWordsArray =[{
        'Word':Text,
        'Count':count of Text,
        'Synonyms':synonym of Text,
        'POS':Noun/Pronoun/verb/adverb/adjective/prep/conj
    }
    ...]
*/

  var finalWordsArray = [];
  finalWordsArray = Object.keys(Wordmap).map((key) => {
    return {
      Word: key,
      Count: Wordmap[key],
    };
  });

  finalWordsArray.sort((a, b) => {
    return b.Count - a.Count;
  });
  //return only top 10 occurencesof words in the data
  return finalWordsArray.slice(0, 11);
}
