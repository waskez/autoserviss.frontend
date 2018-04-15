export class LetterFilterValueConverter {
    toView(array, letter, filterFunc) {
        return array.filter((item) => {
            let matches = letter && letter.length == 1 ? filterFunc(letter, item) : true;
            return matches;
        });
    }
}