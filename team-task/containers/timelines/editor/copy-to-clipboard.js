export default function copyToClipboard(text) {
    if (!navigator.clipboard) {
        alert('Не поддерживается копирование')
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}
