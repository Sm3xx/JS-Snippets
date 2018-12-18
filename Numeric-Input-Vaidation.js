function checkInput(key, target) {
  let input = target.val();

  if (key.match(/[a-z]/i) && key.length === 1) {
    input = input.slice(0, input.length-1);
  } else if (key == "."|| key == ","){
    let commaFound = 0;
    for (let i = 0; i < input.length; i++) {
      if (input.substring(i, i+1) == "," || input.substring(i, i+1) == ".") {
        commaFound++;
        if (commaFound > 1) {
          input = input.slice(0, input.length-1);
        }
      }
    }
  }

  target.val(input);
}
