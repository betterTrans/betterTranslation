// �����ܼ�
var api_key = null    // �]�������ܼơA�y��V�~���ШD½Ķ���ٷ|�Ψ�C
// �^���i�������e�j�Ρi�u�X�����j�e�L�Ӫ��ШD
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    if (message.cmd == 'api_key') {
        api_key = message.data.api_key
        sendResponse(api_key);    // �A��P�˪� api_key ���^���e�^�h
    }
});
