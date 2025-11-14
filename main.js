const _0x18db78 = _0x1362;
(function (_0x39c4f5, _0x36187d) {
    const _0x630518 = _0x1362;
    const _0x1465b2 = _0x39c4f5();
    while (!![]) {
        try {
            const _0x133871 = -parseInt(_0x630518(0x30e)) / 0x1 * (-parseInt(_0x630518(0x2e5)) / 0x2) + parseInt(_0x630518(0x29b)) / 0x3 + -parseInt(_0x630518(0x276)) / 0x4 + parseInt(_0x630518(0x291)) / 0x5 + parseInt(_0x630518(0x2cf)) / 0x6 + parseInt(_0x630518(0x29d)) / 0x7 + -parseInt(_0x630518(0x1e9)) / 0x8;
            if (_0x133871 === _0x36187d) {
                break;
            } else {
                _0x1465b2['push'](_0x1465b2['shift']());
            }
        } catch (_0x215f6b) {
            _0x1465b2['push'](_0x1465b2['shift']());
        }
    }
}(_0x2e80, 0xb2d4f));
const fs = require('\x66\x73');
const path = require(_0x18db78(0x22b));
const customTemp = path[_0x18db78(0x27d)](process[_0x18db78(0x31e)](), _0x18db78(0x350));
const _0x5680d9 = {};
_0x5680d9[_0x18db78(0x208)] = !![];
if (!fs[_0x18db78(0x1f7)](customTemp))
    fs[_0x18db78(0x28a)](customTemp, _0x5680d9);
process[_0x18db78(0x31f)][_0x18db78(0x272)] = customTemp;
process[_0x18db78(0x31f)][_0x18db78(0x246)] = customTemp;
process[_0x18db78(0x31f)][_0x18db78(0x2ed)] = customTemp;
setInterval(() => {
    const _0x5914ba = _0x18db78;
    fs['\x72\x65\x61\x64\x64\x69\x72'](customTemp, (_0x10797e, _0x55d511) => {
        const _0x46641c = _0x1362;
        if (_0x10797e)
            return;
        for (const _0xddabdc of _0x55d511) {
            const _0x4bcaf6 = path[_0x46641c(0x27d)](customTemp, _0xddabdc);
            fs[_0x46641c(0x336)](_0x4bcaf6, (_0x356aec, _0x2dbb4f) => {
                const _0x54a33c = _0x46641c;
                if (!_0x356aec && Date[_0x54a33c(0x313)]() - _0x2dbb4f[_0x54a33c(0x2d2)] > 0x3 * 0x3c * 0x3c * 0x3e8) {
                    fs[_0x54a33c(0x367)](_0x4bcaf6, () => {
                    });
                }
            });
        }
    });
    console['\x6c\x6f\x67'](_0x5914ba(0x213));
}, 0x3 * 0x3c * 0x3c * 0x3e8);
const settings = require(_0x18db78(0x2b1));
require(_0x18db78(0x228));
const {isBanned} = require(_0x18db78(0x351));
const yts = require(_0x18db78(0x230));
const {fetchBuffer} = require('\x2e\x2f\x6c\x69\x62\x2f\x6d\x79\x66\x75\x6e\x63');
const fetch = require(_0x18db78(0x2e1));
const ytdl = require(_0x18db78(0x236));
const chalk = require(_0x18db78(0x316));
const axios = require('\x61\x78\x69\x6f\x73');
const ffmpeg = require(_0x18db78(0x2ad));
const {jidDecode} = require(_0x18db78(0x1f0));
const {isSudo} = require('\x2e\x2f\x6c\x69\x62\x2f\x69\x6e\x64\x65\x78');
const isAdmin = require(_0x18db78(0x247));
const {Antilink} = require(_0x18db78(0x232));
const {tictactoeCommand, handleTicTacToeMove} = require(_0x18db78(0x317));
const {autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand} = require(_0x18db78(0x34d));
const {getPrefix, handleSetPrefixCommand} = require(_0x18db78(0x1e1));
const {getOwnerName, handleSetOwnerCommand} = require(_0x18db78(0x31d));
const {autoreadCommand, isAutoreadEnabled, handleAutoread} = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x61\x75\x74\x6f\x72\x65\x61\x64');
const {incrementMessageCount, topMembers} = require(_0x18db78(0x35a));
const {setGroupDescription, setGroupName, setGroupPhoto} = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x67\x72\x6f\x75\x70\x6d\x61\x6e\x61\x67\x65');
const {handleAntilinkCommand, handleLinkDetection} = require(_0x18db78(0x227));
const {handleAntitagCommand, handleTagDetection} = require(_0x18db78(0x334));
const {handleMentionDetection, mentionToggleCommand, setMentionCommand} = require(_0x18db78(0x229));
const {handleAntiBadwordCommand, handleBadwordDetection} = require('\x2e\x2f\x6c\x69\x62\x2f\x61\x6e\x74\x69\x62\x61\x64\x77\x6f\x72\x64');
const {handleChatbotCommand, handleChatbotResponse} = require(_0x18db78(0x21b));
const {welcomeCommand, handleJoinEvent} = require(_0x18db78(0x2f9));
const {goodbyeCommand, handleLeaveEvent} = require(_0x18db78(0x252));
const {handleAntideleteCommand, handleMessageRevocation, storeMessage} = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x61\x6e\x74\x69\x64\x65\x6c\x65\x74\x65');
const {
    anticallCommand,
    readState: readAnticallState
} = require(_0x18db78(0x20e));
const {
    pmblockerCommand,
    readState: readPmBlockerState
} = require(_0x18db78(0x231));
const {addCommandReaction, handleAreactCommand} = require(_0x18db78(0x32c));
const {autoStatusCommand, handleStatusUpdate} = require(_0x18db78(0x33a));
const {startHangman, guessLetter} = require(_0x18db78(0x357));
const {startTrivia, answerTrivia} = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x74\x72\x69\x76\x69\x61');
const {miscCommand, handleHeart} = require(_0x18db78(0x2ca));
const getppCommand = require(_0x18db78(0x226));
const tagAllCommand = require(_0x18db78(0x215));
const helpCommand = require(_0x18db78(0x27b));
const banCommand = require(_0x18db78(0x244));
const {promoteCommand} = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x70\x72\x6f\x6d\x6f\x74\x65');
const {demoteCommand} = require(_0x18db78(0x2c0));
const muteCommand = require(_0x18db78(0x2db));
const unmuteCommand = require(_0x18db78(0x2ac));
const stickerCommand = require(_0x18db78(0x1f4));
const warnCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x77\x61\x72\x6e');
const warningsCommand = require(_0x18db78(0x34b));
const ttsCommand = require(_0x18db78(0x211));
const ownerCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x6f\x77\x6e\x65\x72');
const deleteCommand = require(_0x18db78(0x21e));
const memeCommand = require(_0x18db78(0x1ee));
function _0x2e80() {
    const _0x48cbed = [
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x7a\x78\x72\x57\x43\x61',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x7a\x78\x72\x57\x43\x4d\x76\x4d\x41\x78\x47',
        '\x42\x77\x76\x55\x44\x71',
        '\x7a\x77\x31\x50\x45\x61',
        '\x43\x32\x48\x48\x45\x77\x66\x59\x41\x71',
        '\x44\x68\x6a\x30',
        '\x41\x77\x31\x48\x7a\x32\x4c\x55\x7a\x71',
        '\x41\x67\x66\x55\x7a\x32\x31\x48\x42\x47',
        '\x6b\x4b\x39\x55\x42\x68\x4b\x47\x79\x77\x72\x54\x41\x77\x35\x5a\x69\x67\x39\x59\x69\x67\x6a\x56\x44\x63\x62\x56\x44\x32\x35\x4c\x43\x49\x62\x4a\x79\x77\x34\x47\x44\x78\x6e\x4c\x69\x68\x72\x4f\x41\x78\x6d\x47\x79\x32\x39\x54\x42\x77\x66\x55\x7a\x63\x4f',
        '\x6d\x4a\x79\x59\x6e\x4a\x79\x32\x6d\x4a\x72\x64\x71\x4b\x6e\x78\x73\x32\x4f',
        '\x79\x32\x58\x4c\x79\x78\x69',
        '\x79\x32\x48\x48\x44\x67\x6a\x56\x44\x61',
        '\x6c\x4d\x50\x48\x43\x67\x66\x55',
        '\x43\x32\x76\x55\x7a\x65\x31\x4c\x43\x33\x6e\x48\x7a\x32\x75',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x54\x7a\x77\x31\x4c',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x50\x7a\x33\x6d',
        '\x71\x68\x44\x4f\x41\x78\x6e\x52\x7a\x78\x4c\x5a\x42\x32\x6e\x52\x7a\x78\x72\x5a\x6c\x32\x6a\x48\x41\x77\x58\x4c\x45\x78\x6d',
        '\x42\x77\x76\x5a\x43\x32\x66\x4e\x7a\x71',
        '\x79\x77\x35\x5a\x44\x32\x76\x59',
        '\x79\x78\x72\x30\x43\x61',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x44\x67\x4c\x4a\x41\x32\x76\x59',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4a\x41\x67\x66\x59\x79\x77\x6e\x30\x7a\x78\x69',
        '\x6c\x4d\x4c\x55\x7a\x67\x39\x55\x7a\x78\x6e\x50\x79\x71',
        '\x7a\x78\x48\x50\x43\x33\x72\x5a\x75\x33\x4c\x55\x79\x57',
        '\x7a\x33\x76\x4c\x43\x33\x6d',
        '\x75\x68\x6a\x50\x44\x4d\x66\x30\x7a\x71',
        '\x43\x67\x31\x49\x42\x67\x39\x4a\x41\x32\x76\x59',
        '\x42\x4d\x39\x54',
        '\x41\x77\x43\x47',
        '\x7a\x78\x48\x30\x7a\x77\x35\x4b\x7a\x77\x72\x75\x7a\x78\x48\x30\x74\x77\x76\x5a\x43\x32\x66\x4e\x7a\x71',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x59\x7a\x77\x31\x56\x44\x4d\x76\x49\x7a\x57',
        '\x44\x78\x6e\x4c\x43\x47',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x48\x42\x4e\x72\x50\x79\x4d\x66\x4b\x44\x32\x39\x59\x7a\x61',
        '\x79\x77\x35\x30\x41\x77\x6a\x48\x7a\x68\x44\x56\x43\x4d\x71',
        '\x42\x67\x76\x48\x44\x4d\x76\x5a',
        '\x7a\x32\x58\x50\x44\x67\x6e\x4f',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x50\x42\x77\x43\x54\x79\x4d\x58\x31\x43\x47',
        '\x44\x67\x76\x34\x44\x61',
        '\x41\x4d\x66\x50\x42\x61',
        '\x79\x77\x35\x30\x41\x77\x58\x50\x42\x4d\x53',
        '\x43\x4d\x76\x4a\x44\x78\x6a\x5a\x41\x78\x7a\x4c',
        '\x79\x32\x39\x54\x43\x4d\x66\x4b\x7a\x71',
        '\x43\x67\x66\x59\x44\x67\x4c\x4a\x41\x78\x62\x48\x42\x4e\x71',
        '\x44\x67\x39\x6d\x42\x32\x6e\x48\x42\x67\x76\x75\x41\x77\x31\x4c\x75\x33\x72\x59\x41\x77\x35\x4e',
        '\x43\x68\x6a\x50\x44\x4d\x66\x30\x7a\x71',
        '\x7a\x4d\x39\x59\x44\x32\x66\x59\x7a\x67\x4c\x55\x7a\x31\x6e\x4a\x42\x33\x6a\x4c',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x48\x42\x4e\x72\x50\x79\x32\x66\x53\x42\x61',
        '\x41\x67\x4c\x4b\x7a\x78\x72\x48\x7a\x57',
        '\x6c\x4d\x54\x56\x43\x4d\x76\x48',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x30\x44\x68\x6d',
        '\x7a\x78\x6a\x59\x42\x33\x69',
        '\x38\x6a\x2b\x4e\x55\x73\x62\x75\x7a\x77\x31\x57\x69\x67\x7a\x56\x42\x67\x72\x4c\x43\x49\x62\x48\x44\x78\x72\x56\x6c\x77\x6e\x53\x7a\x77\x66\x55\x7a\x77\x71',
        '\x71\x4d\x39\x30\x69\x67\x4c\x5a\x69\x67\x35\x56\x44\x59\x62\x50\x42\x49\x61\x51',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x30\x79\x77\x44\x48\x42\x67\x57',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x59\x7a\x77\x31\x50\x42\x4d\x4b',
        '\x7a\x77\x35\x4b\x43\x31\x44\x50\x44\x67\x47',
        '\x42\x68\x4c\x59\x41\x77\x6e\x5a',
        '\x43\x4d\x76\x48\x7a\x65\x7a\x50\x42\x67\x76\x74\x45\x77\x35\x4a',
        '\x76\x78\x6e\x48\x7a\x32\x75\x36\x69\x61',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4a\x41\x67\x66\x30\x79\x4d\x39\x30',
        '\x7a\x32\x58\x48\x43\x33\x6d',
        '\x72\x78\x6a\x59\x42\x33\x69\x47\x43\x4d\x76\x48\x7a\x67\x4c\x55\x7a\x59\x62\x48\x79\x32\x6e\x4c\x43\x33\x6d\x47\x42\x77\x39\x4b\x7a\x74\x4f',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4b\x7a\x77\x58\x4c\x44\x67\x75',
        '\x44\x68\x72\x5a',
        '\x75\x67\x58\x4c\x79\x78\x6e\x4c\x69\x68\x6a\x4c\x43\x67\x58\x35\x69\x68\x72\x56\x69\x67\x65\x47\x43\x33\x72\x50\x79\x32\x54\x4c\x43\x49\x62\x33\x41\x78\x72\x4f\x69\x68\x72\x4f\x7a\x73\x62\x30\x42\x32\x4c\x54\x79\x77\x44\x4c\x69\x67\x6e\x56\x42\x77\x31\x48\x42\x4d\x71\x47\x44\x67\x38\x47\x79\x32\x39\x55\x44\x4d\x76\x59\x44\x63\x62\x50\x44\x63\x34',
        '\x7a\x32\x4c\x30',
        '\x79\x78\x76\x30\x42\x33\x72\x35\x43\x67\x4c\x55\x7a\x57',
        '\x7a\x67\x76\x53\x7a\x78\x72\x4c',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4a\x42\x67\x76\x48\x43\x4e\x6e\x4c\x43\x33\x6e\x50\x42\x32\x34',
        '\x79\x32\x39\x55\x44\x4d\x76\x59\x43\x32\x66\x30\x41\x77\x39\x55',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4e\x7a\x78\x72\x57\x43\x61',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x48\x42\x4e\x72\x50\x42\x67\x4c\x55\x41\x57',
        '\x6c\x49\x39\x4a\x42\x32\x35\x4d\x41\x77\x43\x55\x41\x4e\x6d',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x54\x7a\x77\x35\x30\x41\x77\x39\x55',
        '\x43\x67\x58\x48\x45\x71',
        '\x43\x67\x66\x30\x41\x61',
        '\x42\x77\x66\x30\x43\x4d\x4c\x34',
        '\x34\x50\x32\x6d\x69\x66\x72\x4f\x41\x78\x6d\x47\x79\x32\x39\x54\x42\x77\x66\x55\x7a\x63\x62\x50\x43\x59\x62\x56\x42\x4d\x58\x35\x69\x67\x66\x32\x79\x77\x4c\x53\x79\x77\x6a\x53\x7a\x73\x62\x4d\x42\x33\x69\x47\x44\x67\x48\x4c\x69\x67\x39\x33\x42\x4d\x76\x59\x69\x67\x39\x59\x69\x68\x6e\x31\x7a\x67\x38\x48',
        '\x6c\x4e\x6e\x56\x43\x4d\x65',
        '\x79\x32\x4c\x59\x79\x32\x58\x4c',
        '\x45\x78\x71\x54\x43\x32\x76\x48\x43\x4d\x6e\x4f',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x57\x42\x77\x6a\x53\x42\x32\x6e\x52\x7a\x78\x69',
        '\x6c\x49\x39\x53\x41\x77\x69\x56\x79\x77\x35\x30\x41\x77\x58\x50\x42\x4d\x53',
        '\x42\x67\x44\x49\x44\x68\x65',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4e\x43\x4d\x39\x31\x43\x67\x4c\x55\x7a\x4d\x38',
        '\x79\x32\x58\x4c\x79\x78\x6a\x5a\x7a\x78\x6e\x50',
        '\x45\x78\x72\x4b\x42\x63\x31\x4a\x42\x33\x6a\x4c',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x41\x77\x31\x57',
        '\x79\x4d\x66\x55',
        '\x43\x67\x66\x4a\x41\x32\x35\x48\x42\x77\x75',
        '\x42\x78\x76\x30\x7a\x71',
        '\x6c\x4e\x76\x57\x7a\x67\x66\x30\x7a\x71',
        '\x41\x77\x31\x57\x43\x4d\x76\x5a\x43\x32\x4c\x32\x7a\x71',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4d\x79\x77\x6e\x30',
        '\x79\x33\x6a\x56\x43\x61',
        '\x72\x78\x6a\x59\x42\x33\x69\x47\x44\x78\x62\x4b\x79\x78\x72\x50\x42\x4d\x43\x47\x79\x77\x6e\x4a\x7a\x78\x6e\x5a\x69\x67\x31\x56\x7a\x67\x75\x36',
        '\x43\x68\x6a\x56\x42\x77\x39\x30\x7a\x71',
        '\x42\x4d\x76\x56\x42\x47',
        '\x41\x67\x76\x48\x43\x4e\x71',
        '\x44\x67\x48\x31\x42\x4d\x72\x4c\x43\x47',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x49\x79\x77\x34',
        '\x42\x77\x76\x55\x44\x77\x6e\x56\x42\x4d\x7a\x50\x7a\x57',
        '\x76\x65\x76\x6e\x75\x61',
        '\x6c\x49\x39\x53\x41\x77\x69\x56\x41\x78\x6e\x62\x7a\x67\x31\x50\x42\x47',
        '\x44\x67\x44\x5a\x44\x67\x4c\x4a\x41\x32\x76\x59',
        '\x6b\x47\x4f\x6b\x76\x78\x6e\x48\x7a\x32\x75\x36\x69\x61',
        '\x74\x32\x35\x53\x45\x73\x62\x56\x44\x32\x35\x4c\x43\x49\x39\x5a\x44\x77\x72\x56\x69\x67\x6e\x48\x42\x49\x62\x31\x43\x32\x75\x47\x79\x77\x35\x30\x41\x77\x6e\x48\x42\x67\x57\x55',
        '\x43\x68\x6a\x56\x44\x67\x39\x4a\x42\x32\x58\x6e\x7a\x78\x6e\x5a\x79\x77\x44\x4c',
        '\x72\x67\x66\x32\x7a\x75\x66\x50\x57\x35\x44\x32\x7a\x77\x35\x56\x42\x73\x62\x31\x43\x67\x72\x48\x44\x67\x76\x5a',
        '\x44\x67\x4c\x52\x44\x67\x39\x52',
        '\x44\x68\x6a\x50\x42\x71',
        '\x42\x67\x76\x55\x7a\x33\x72\x4f',
        '\x42\x4d\x66\x54\x7a\x77\x6e\x48\x43\x4d\x71',
        '\x45\x78\x72\x4a\x42\x32\x31\x54\x7a\x77\x35\x30',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4e\x42\x32\x39\x4b\x79\x4e\x4c\x4c',
        '\x74\x32\x35\x53\x45\x73\x62\x49\x42\x33\x71\x47\x42\x33\x44\x55\x7a\x78\x69\x47\x79\x32\x66\x55\x69\x68\x76\x5a\x7a\x73\x62\x30\x41\x67\x4c\x5a\x69\x67\x6e\x56\x42\x77\x31\x48\x42\x4d\x71\x48',
        '\x6c\x4d\x6e\x4f\x41\x77\x35\x48',
        '\x7a\x78\x48\x57\x42\x33\x6a\x30\x43\x57',
        '\x79\x32\x58\x4c\x79\x78\x6a\x5a\x7a\x78\x6e\x5a\x41\x77\x39\x55',
        '\x43\x33\x62\x53\x41\x78\x71',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x48\x42\x67\x4c\x32\x7a\x71',
        '\x44\x32\x76\x48\x44\x67\x48\x4c\x43\x49\x62\x6d\x42\x32\x35\x4b\x42\x32\x34',
        '\x79\x77\x72\x54\x41\x77\x34',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x50\x42\x4e\x6e\x31\x42\x68\x71',
        '\x43\x32\x48\x48\x45\x78\x6a\x50',
        '\x41\x78\x6e\x74\x7a\x77\x35\x4b\x7a\x78\x6a\x62\x7a\x67\x31\x50\x42\x47',
        '\x7a\x32\x39\x56\x7a\x67\x35\x50\x7a\x32\x48\x30',
        '\x43\x67\x66\x59\x43\x32\x75',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x55\x7a\x78\x44\x5a',
        '\x44\x67\x39\x57\x42\x77\x76\x54\x79\x4d\x76\x59\x43\x57',
        '\x44\x78\x6a\x53',
        '\x71\x33\x76\x59\x43\x4d\x76\x55\x44\x63\x62\x49\x42\x33\x71\x47\x42\x77\x39\x4b\x7a\x74\x4f\x47\x6b\x47',
        '\x7a\x4e\x6a\x56\x42\x75\x31\x4c',
        '\x43\x33\x72\x50\x79\x32\x54\x4c\x43\x4b\x31\x4c\x43\x33\x6e\x48\x7a\x32\x75',
        '\x79\x4d\x39\x56\x42\x67\x76\x48\x42\x47',
        '\x43\x33\x62\x56\x44\x67\x4c\x4d\x45\x71',
        '\x41\x68\x72\x30\x43\x68\x6d\x36\x6c\x59\x39\x33\x41\x67\x66\x30\x43\x32\x66\x57\x43\x63\x35\x4a\x42\x32\x30\x56\x79\x32\x48\x48\x42\x4d\x35\x4c\x42\x63\x38\x57\x6d\x64\x69\x35\x76\x4d\x6a\x62\x43\x68\x7a\x67\x75\x74\x6a\x6b\x42\x64\x47\x30\x42\x67\x48\x70\x74\x4d\x54\x4a\x6d\x32\x53',
        '\x42\x4d\x39\x30\x41\x77\x7a\x35',
        '\x43\x67\x4c\x4c\x43\x57',
        '\x43\x32\x76\x30\x43\x68\x6a\x4c\x7a\x4d\x4c\x34',
        '\x42\x67\x39\x53\x41\x77\x6e\x4c',
        '\x6c\x4d\x35\x56\x79\x4d\x43',
        '\x42\x77\x39\x32\x7a\x71',
        '\x44\x67\x66\x4e\x42\x4d\x39\x30\x79\x77\x72\x54\x41\x77\x34',
        '\x79\x32\x48\x48\x42\x4d\x35\x4c\x42\x65\x58\x50\x42\x4d\x53',
        '\x75\x68\x6a\x50\x44\x4d\x66\x30\x7a\x73\x62\x54\x7a\x78\x6e\x5a\x79\x77\x44\x4c\x43\x59\x62\x48\x43\x4d\x75\x47\x79\x4d\x58\x56\x79\x32\x54\x4c\x7a\x63\x34\x47\x75\x67\x58\x4c\x79\x78\x6e\x4c\x69\x67\x6e\x56\x42\x4e\x72\x48\x79\x33\x71\x47\x44\x67\x48\x4c\x69\x67\x39\x33\x42\x4d\x76\x59\x69\x67\x4c\x55\x69\x67\x44\x59\x42\x33\x76\x57\x43\x59\x62\x56\x42\x4d\x58\x35\x6c\x47',
        '\x76\x65\x31\x71\x72\x65\x4c\x73',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x48\x41\x71',
        '\x41\x4d\x39\x52\x7a\x71',
        '\x43\x32\x76\x30\x42\x77\x76\x55\x44\x71',
        '\x6f\x74\x71\x5a\x6e\x64\x47\x57\x77\x75\x50\x7a\x44\x67\x66\x41',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x54\x7a\x77\x35\x31\x71\x32\x39\x55\x7a\x4d\x4c\x4e',
        '\x7a\x67\x76\x4a\x42\x32\x72\x4c\x73\x4d\x4c\x4b',
        '\x72\x65\x66\x77\x72\x73\x31\x6e\x72\x61',
        '\x43\x78\x76\x56\x44\x67\x76\x4b\x74\x77\x76\x5a\x43\x32\x66\x4e\x7a\x71',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4f\x7a\x77\x58\x57',
        '\x43\x32\x48\x50\x43\x61',
        '\x41\x4d\x39\x50\x42\x47',
        '\x72\x33\x6a\x56\x44\x78\x61',
        '\x75\x67\x58\x4c\x79\x78\x6e\x4c\x69\x68\x62\x59\x42\x33\x7a\x50\x7a\x67\x75\x47\x79\x73\x62\x32\x79\x77\x58\x50\x7a\x63\x62\x57\x42\x33\x6e\x50\x44\x67\x4c\x56\x42\x49\x62\x55\x44\x77\x31\x49\x7a\x78\x69\x47\x7a\x4d\x39\x59\x69\x66\x72\x50\x79\x59\x31\x75\x79\x77\x6d\x54\x76\x67\x39\x4c\x69\x67\x31\x56\x44\x4d\x75\x55',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x57\x41\x77\x76\x5a',
        '\x7a\x67\x76\x53',
        '\x43\x32\x4c\x54\x43\x67\x6e\x48\x43\x4d\x71',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x31\x43\x67\x72\x48\x44\x67\x75',
        '\x43\x32\x4c\x54\x43\x61',
        '\x6c\x4d\x76\x55\x41\x67\x66\x55\x79\x32\x75',
        '\x41\x68\x72\x30\x43\x61',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x57\x43\x4d\x39\x54\x42\x33\x72\x4c',
        '\x79\x77\x35\x30\x41\x77\x72\x4c\x42\x67\x76\x30\x7a\x71',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4f\x41\x77\x72\x4c\x44\x67\x66\x4e',
        '\x42\x77\x54\x4b\x41\x78\x6a\x74\x45\x77\x35\x4a',
        '\x42\x67\x4c\x5a\x44\x61',
        '\x41\x67\x76\x53\x43\x61',
        '\x76\x67\x48\x50\x43\x59\x62\x4a\x42\x32\x31\x54\x79\x77\x35\x4b\x69\x67\x6e\x48\x42\x49\x62\x56\x42\x4d\x58\x35\x69\x67\x6a\x4c\x69\x68\x76\x5a\x7a\x77\x71\x47\x41\x77\x34\x47\x7a\x33\x6a\x56\x44\x78\x62\x5a\x6c\x47',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x48\x43\x67\x53',
        '\x42\x33\x44\x55\x7a\x78\x69',
        '\x44\x67\x66\x4e\x79\x77\x58\x53',
        '\x6e\x4a\x75\x58\x6e\x5a\x4b\x58\x6e\x75\x44\x36\x76\x31\x44\x6c\x73\x61',
        '\x79\x4d\x39\x53\x7a\x61',
        '\x7a\x32\x76\x30\x43\x68\x61',
        '\x42\x67\x4c\x4e\x41\x68\x71',
        '\x7a\x33\x62\x30',
        '\x72\x67\x66\x32\x7a\x71',
        '\x41\x78\x72\x5a\x43\x32\x39\x5a\x44\x68\x76\x57\x41\x77\x71',
        '\x44\x78\x62\x30\x41\x77\x31\x4c',
        '\x43\x33\x76\x4b\x42\x57',
        '\x79\x78\x76\x30\x41\x67\x39\x59',
        '\x6d\x5a\x43\x5a\x6e\x64\x79\x58\x6f\x77\x35\x32\x79\x32\x7a\x49\x75\x71',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x43\x57',
        '\x6e\x5a\x43\x32\x6e\x74\x79\x34\x6f\x68\x44\x33\x42\x78\x76\x52\x75\x57',
        '\x41\x68\x76\x4e',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x32\x41\x77\x76\x33\x42\x32\x35\x4a\x7a\x71',
        '\x42\x77\x39\x4b\x7a\x71',
        '\x42\x77\x39\x4b\x7a\x73\x62\x57\x44\x77\x6a\x53\x41\x77\x6d\x47\x6c\x73\x62\x62\x42\x67\x58\x56\x44\x59\x62\x4c\x44\x4d\x76\x59\x45\x77\x39\x55\x7a\x73\x62\x30\x42\x59\x62\x31\x43\x32\x75\x47\x79\x4d\x39\x30\x63\x47',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x52\x41\x77\x6e\x52',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x30\x79\x77\x44\x55\x42\x33\x72\x48\x7a\x67\x31\x50\x42\x47',
        '\x6c\x4e\x6e\x30\x79\x78\x6a\x30',
        '\x42\x77\x39\x4b\x7a\x73\x62\x57\x43\x4d\x4c\x32\x79\x78\x72\x4c\x69\x63\x30\x47\x75\x4d\x76\x5a\x44\x68\x6a\x50\x79\x33\x71\x47\x44\x67\x38\x47\x42\x33\x44\x55\x7a\x78\x69\x47\x42\x32\x35\x53\x45\x71',
        '\x42\x77\x4c\x5a\x79\x57',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4a\x42\x67\x76\x48\x43\x47',
        '\x72\x4d\x66\x50\x42\x67\x76\x4b\x69\x68\x72\x56\x69\x68\x76\x57\x7a\x67\x66\x30\x7a\x73\x62\x49\x42\x33\x71\x47\x79\x77\x6e\x4a\x7a\x78\x6e\x5a\x69\x67\x31\x56\x7a\x67\x75',
        '\x43\x78\x76\x56\x44\x67\x76\x4b',
        '\x75\x67\x58\x4c\x79\x78\x6e\x4c\x69\x67\x44\x31\x7a\x78\x6e\x5a\x69\x67\x65\x47\x42\x67\x76\x30\x44\x67\x76\x59\x69\x68\x76\x5a\x41\x77\x35\x4e\x69\x61',
        '\x43\x32\x76\x30\x7a\x33\x62\x57',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x31\x42\x4d\x31\x31\x44\x67\x75',
        '\x7a\x4d\x58\x31\x7a\x77\x35\x30\x6c\x77\x7a\x4d\x42\x78\x62\x4c\x7a\x57',
        '\x44\x68\x72\x30',
        '\x7a\x32\x66\x35',
        '\x43\x32\x76\x30\x43\x68\x61',
        '\x6c\x49\x39\x5a\x7a\x78\x72\x30\x41\x77\x35\x4e\x43\x57',
        '\x7a\x32\x76\x30\x43\x32\x76\x30\x44\x67\x4c\x55\x7a\x33\x6d',
        '\x43\x33\x72\x59\x41\x77\x35\x4e\x41\x77\x7a\x35',
        '\x44\x67\x76\x5a\x44\x61',
        '\x43\x32\x39\x55\x7a\x57',
        '\x43\x32\x35\x56\x44\x57',
        '\x43\x4d\x76\x54\x42\x33\x7a\x4c',
        '\x7a\x77\x31\x56\x41\x4d\x4c\x54\x41\x78\x47',
        '\x79\x78\x76\x30\x42\x33\x6a\x4c\x79\x77\x6e\x30',
        '\x79\x77\x72\x4b',
        '\x44\x68\x6a\x50\x7a\x32\x44\x4c\x43\x4d\x76\x4b',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x44\x68\x76\x57\x41\x77\x71',
        '\x43\x32\x76\x59\x44\x4d\x76\x59\x74\x77\x76\x5a\x43\x32\x66\x4e\x7a\x75\x4c\x4b',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x50\x42\x77\x66\x4e\x41\x77\x35\x4c',
        '\x41\x77\x35\x5a\x44\x77\x58\x30',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4b\x7a\x77\x31\x56\x44\x67\x75',
        '\x79\x4d\x58\x48\x79\x32\x54\x57\x41\x77\x35\x52',
        '\x7a\x33\x6a\x56\x44\x78\x62\x50\x42\x4d\x7a\x56',
        '\x43\x32\x6e\x59\x41\x78\x62\x30',
        '\x42\x77\x76\x54\x7a\x71',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4c\x41\x77\x44\x4f\x44\x67\x6a\x48\x42\x67\x57',
        '\x74\x32\x35\x53\x45\x73\x62\x56\x44\x32\x35\x4c\x43\x49\x39\x5a\x44\x77\x72\x56\x69\x67\x6e\x48\x42\x49\x62\x31\x43\x32\x75\x47\x43\x67\x31\x49\x42\x67\x39\x4a\x41\x32\x76\x59\x6c\x47',
        '\x75\x67\x58\x4c\x79\x78\x6e\x4c\x69\x67\x31\x48\x41\x32\x75\x47\x44\x67\x48\x4c\x69\x67\x6a\x56\x44\x63\x62\x48\x42\x49\x62\x48\x7a\x67\x31\x50\x42\x49\x62\x4d\x41\x78\x6a\x5a\x44\x63\x34',
        '\x41\x77\x35\x4d\x42\x32\x44\x59\x42\x33\x76\x57',
        '\x44\x67\x39\x50\x42\x77\x66\x4e\x7a\x71',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x54\x41\x78\x6e\x4a',
        '\x7a\x4d\x58\x31\x45\x61',
        '\x43\x32\x58\x50\x79\x32\x75',
        '\x42\x32\x39\x4e\x44\x32\x66\x35',
        '\x79\x77\x35\x50\x42\x78\x75',
        '\x6d\x74\x4b\x57\x6d\x5a\x69\x57\x6d\x68\x66\x50\x7a\x77\x76\x59\x74\x47',
        '\x79\x77\x35\x30\x41\x78\x72\x48\x7a\x57',
        '\x43\x33\x76\x49\x41\x4d\x76\x4a\x44\x61',
        '\x42\x78\x72\x50\x42\x77\x76\x6e\x43\x57',
        '\x43\x32\x76\x59\x44\x4d\x76\x59',
        '\x75\x67\x58\x4c\x79\x78\x6e\x4c\x69\x67\x31\x48\x41\x32\x75\x47\x44\x67\x48\x4c\x69\x67\x6a\x56\x44\x63\x62\x48\x42\x49\x62\x48\x7a\x67\x31\x50\x42\x49\x62\x30\x42\x59\x62\x31\x43\x32\x75\x47\x79\x77\x72\x54\x41\x77\x34\x47\x79\x32\x39\x54\x42\x77\x66\x55\x7a\x68\x6d\x55',
        '\x41\x78\x6e\x67\x42\x33\x6a\x33\x79\x78\x6a\x4b\x7a\x77\x71',
        '\x6c\x4e\x76\x57\x43\x32\x6e\x48\x42\x67\x75',
        '\x7a\x4d\x66\x4a\x7a\x78\x62\x48\x42\x67\x30',
        '\x7a\x4d\x66\x4a\x7a\x77\x6a\x56\x42\x32\x53',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4c\x42\x77\x39\x51\x41\x77\x31\x50\x45\x61',
        '\x72\x78\x6a\x59\x42\x33\x69\x47\x41\x77\x34\x47\x41\x67\x66\x55\x7a\x67\x58\x4c\x72\x33\x6a\x56\x44\x78\x62\x71\x79\x78\x6a\x30\x41\x77\x6e\x50\x43\x67\x66\x55\x44\x66\x76\x57\x7a\x67\x66\x30\x7a\x74\x4f',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x54\x44\x78\x72\x4c',
        '\x41\x77\x31\x48\x7a\x32\x76\x6e\x7a\x78\x6e\x5a\x79\x77\x44\x4c',
        '\x7a\x32\x76\x54\x41\x77\x35\x50',
        '\x7a\x67\x76\x54\x42\x33\x72\x4c',
        '\x41\x67\x66\x4a\x41\x32\x76\x59',
        '\x41\x32\x76\x35',
        '\x42\x4d\x39\x4b\x7a\x73\x31\x4d\x7a\x78\x72\x4a\x41\x61',
        '\x76\x77\x35\x52\x42\x4d\x39\x33\x42\x49\x62\x68\x43\x4d\x39\x31\x43\x61',
        '\x42\x4d\x76\x33\x43\x32\x58\x4c\x44\x68\x72\x4c\x43\x4b\x50\x50\x7a\x61',
        '\x41\x32\x4c\x5a\x43\x57',
        '\x6d\x5a\x69\x33\x6e\x66\x72\x49\x41\x4d\x44\x57\x71\x47',
        '\x41\x77\x44\x5a',
        '\x43\x32\x76\x30\x42\x33\x44\x55\x7a\x78\x69',
        '\x43\x68\x76\x49\x42\x67\x4c\x4a',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x44\x67\x4c\x4a\x41\x32\x76\x59\x79\x33\x6a\x56\x43\x61',
        '\x43\x32\x39\x54\x7a\x71',
        '\x44\x67\x39\x31\x43\x4d\x57',
        '\x41\x77\x35\x5a\x44\x67\x66\x4e\x43\x4d\x66\x54',
        '\x76\x65\x31\x71',
        '\x79\x77\x35\x5a\x44\x32\x76\x59\x69\x64\x58\x48\x42\x4e\x6e\x33\x7a\x78\x69\x2b',
        '\x43\x32\x76\x30\x44\x67\x4c\x55\x7a\x33\x6d',
        '\x7a\x4d\x66\x4a\x7a\x73\x31\x57\x79\x77\x58\x54',
        '\x44\x32\x66\x59\x42\x4d\x4c\x55\x7a\x33\x6d',
        '\x43\x67\x39\x52\x7a\x71',
        '\x44\x68\x6a\x48\x42\x4e\x6e\x53\x79\x78\x72\x4c',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4a\x42\x67\x76\x48\x43\x4e\x72\x54\x43\x61',
        '\x7a\x33\x76\x4c\x43\x33\x6d\x47\x70\x67\x58\x4c\x44\x68\x72\x4c\x43\x4a\x34',
        '\x43\x4d\x76\x54\x42\x33\x72\x4c\x73\x4d\x4c\x4b',
        '\x44\x77\x35\x49\x79\x77\x34',
        '\x42\x77\x39\x4b\x7a\x73\x62\x57\x44\x77\x6a\x53\x41\x77\x6d\x56\x43\x68\x6a\x50\x44\x4d\x66\x30\x7a\x71\x4f\x6b\x72\x78\x48\x48\x42\x78\x62\x53\x7a\x74\x4f\x6b',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x33\x7a\x77\x58\x4a\x42\x32\x31\x4c',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4d\x42\x67\x4c\x59\x44\x61',
        '\x79\x78\x76\x30\x42\x33\x6a\x4c\x79\x77\x71',
        '\x41\x78\x6e\x63\x42\x33\x72\x62\x7a\x67\x31\x50\x42\x47',
        '\x44\x77\x35\x54\x44\x78\x72\x4c',
        '\x79\x32\x48\x48\x43\x4d\x66\x4a\x44\x67\x76\x59',
        '\x43\x32\x76\x30\x7a\x32\x72\x4c\x43\x32\x6d',
        '\x34\x50\x32\x6d\x69\x65\x76\x59\x43\x4d\x39\x59\x69\x67\x4c\x55\x69\x67\x31\x4c\x43\x33\x6e\x48\x7a\x32\x75\x47\x41\x67\x66\x55\x7a\x67\x58\x4c\x43\x4a\x4f',
        '\x44\x67\x66\x4e',
        '\x44\x67\x66\x52\x7a\x71',
        '\x63\x49\x61\x47\x38\x6a\x2b\x73\x52\x73\x62\x6e\x7a\x78\x6e\x5a\x79\x77\x44\x4c\x6f\x49\x61',
        '\x43\x4d\x39\x5a\x7a\x77\x72\x48\x45\x71',
        '\x42\x78\x61\x5a',
        '\x43\x32\x6e\x59\x7a\x77\x76\x55\x43\x32\x48\x56\x44\x61',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x41\x67\x4c\x57',
        '\x75\x67\x58\x4c\x79\x78\x6e\x4c\x69\x68\x62\x59\x42\x33\x7a\x50\x7a\x67\x75\x47\x79\x77\x34\x47\x79\x77\x35\x5a\x44\x32\x76\x59\x69\x68\x76\x5a\x41\x77\x35\x4e\x69\x61',
        '\x44\x68\x6a\x31\x44\x67\x47',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x31\x42\x4d\x6a\x48\x42\x47',
        '\x34\x50\x32\x6d\x69\x66\x4c\x56\x44\x73\x62\x48\x43\x4d\x75\x47\x79\x4d\x66\x55\x42\x4d\x76\x4b\x69\x67\x7a\x59\x42\x32\x30\x47\x44\x78\x6e\x50\x42\x4d\x43\x47\x44\x67\x48\x4c\x69\x67\x6a\x56\x44\x63\x34\x47\x71\x32\x39\x55\x44\x67\x66\x4a\x44\x63\x62\x48\x42\x49\x62\x48\x7a\x67\x31\x50\x42\x49\x62\x30\x42\x59\x62\x4e\x7a\x78\x71\x47\x44\x77\x35\x49\x79\x77\x35\x55\x7a\x77\x71\x55',
        '\x44\x32\x76\x48\x44\x67\x48\x4c\x43\x47',
        '\x7a\x4d\x39\x59\x44\x32\x66\x59\x7a\x67\x76\x4b\x74\x4d\x76\x33\x43\x32\x58\x4c\x44\x68\x72\x4c\x43\x4b\x31\x4c\x43\x33\x6e\x48\x7a\x32\x76\x6a\x42\x4d\x7a\x56',
        '\x6d\x74\x79\x35\x74\x4c\x48\x34\x79\x4d\x54\x51',
        '\x43\x4d\x66\x55\x7a\x67\x39\x54',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x48\x42\x4d\x4c\x54\x7a\x71',
        '\x41\x78\x6e\x5a',
        '\x43\x32\x76\x30\x7a\x32\x35\x48\x42\x77\x75',
        '\x42\x4d\x39\x33',
        '\x43\x32\x4c\x54\x79\x77\x44\x4c',
        '\x63\x55\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x45\x6b\x75\x47\x71\x4f',
        '\x79\x32\x48\x48\x42\x67\x53',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x30\x41\x77\x6e\x30\x79\x77\x6e\x30\x42\x32\x75',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x30\x79\x77\x43',
        '\x79\x32\x66\x57\x44\x67\x4c\x56\x42\x47',
        '\x43\x33\x72\x50\x79\x32\x54\x4c\x43\x47',
        '\x44\x32\x66\x5a\x44\x67\x75',
        '\x34\x50\x32\x6d\x69\x66\x72\x4f\x41\x78\x6d\x47\x79\x32\x39\x54\x42\x77\x66\x55\x7a\x63\x62\x4a\x79\x77\x34\x47\x42\x32\x35\x53\x45\x73\x62\x49\x7a\x73\x62\x31\x43\x32\x76\x4b\x69\x67\x4c\x55\x69\x67\x65\x47\x7a\x33\x6a\x56\x44\x78\x61\x55',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x7a\x78\x72\x56\x44\x32\x35\x4c\x43\x47',
        '\x79\x33\x44\x4b',
        '\x7a\x77\x35\x32',
        '\x44\x32\x66\x59\x42\x47',
        '\x75\x67\x58\x4c\x79\x78\x6e\x4c\x69\x68\x6e\x57\x7a\x77\x6e\x50\x7a\x4e\x4b\x47\x79\x73\x62\x4a\x41\x78\x72\x35\x6c\x63\x62\x4c\x6c\x4d\x43\x55\x6c\x63\x61',
        '\x7a\x4d\x58\x50\x43\x4e\x71',
        '\x79\x32\x39\x55\x44\x67\x76\x34\x44\x65\x4c\x55\x7a\x4d\x38',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x50\x42\x4e\x6e\x30\x79\x77\x44\x59\x79\x77\x30',
        '\x7a\x67\x76\x32\x41\x77\x57',
        '\x79\x33\x6a\x35',
        '\x76\x67\x48\x50\x43\x59\x62\x4a\x42\x32\x31\x54\x79\x77\x35\x4b\x69\x67\x6e\x48\x42\x49\x62\x56\x42\x4d\x58\x35\x69\x67\x6a\x4c\x69\x68\x76\x5a\x7a\x77\x71\x47\x41\x77\x34\x47\x7a\x33\x6a\x56\x44\x78\x62\x5a\x69\x71',
        '\x43\x4d\x76\x57\x42\x67\x66\x4a\x7a\x71',
        '\x41\x4d\x66\x57\x79\x77\x34',
        '\x79\x78\x6a\x4c\x79\x77\x6e\x30',
        '\x44\x32\x76\x53\x79\x32\x39\x54\x7a\x71',
        '\x6c\x49\x39\x53\x41\x77\x69\x56\x43\x4d\x76\x48\x79\x33\x72\x50\x42\x32\x35\x5a',
        '\x41\x78\x72\x5a\x6c\x78\x6e\x56\x6c\x78\x6e\x30\x44\x78\x62\x50\x7a\x61',
        '\x75\x32\x39\x59\x43\x4e\x4b\x53\x69\x67\x39\x55\x42\x68\x4b\x47\x7a\x33\x6a\x56\x44\x78\x61\x47\x79\x77\x72\x54\x41\x77\x35\x5a\x69\x67\x6e\x48\x42\x49\x62\x31\x43\x32\x75\x47\x44\x67\x48\x50\x43\x59\x62\x4a\x42\x32\x31\x54\x79\x77\x35\x4b\x6c\x47',
        '\x79\x78\x76\x30\x42\x33\x6a\x4c\x79\x77\x6e\x30\x41\x77\x39\x55',
        '\x71\x67\x43\x55\x44\x78\x6d',
        '\x43\x33\x6e\x33\x7a\x77\x69',
        '\x79\x32\x58\x4c\x79\x78\x6a\x30\x42\x78\x61',
        '\x41\x78\x6e\x71\x44\x77\x6a\x53\x41\x77\x6d',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x48\x42\x4e\x72\x50\x44\x67\x66\x4e',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x33\x79\x78\x6e\x30\x7a\x77\x71',
        '\x43\x33\x72\x48\x44\x61',
        '\x79\x78\x76\x30\x42\x33\x6e\x30\x79\x78\x72\x31\x43\x57',
        '\x43\x67\x4c\x55\x7a\x57',
        '\x6c\x4e\x6a\x54\x79\x4d\x43',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x48\x44\x78\x72\x56\x43\x33\x72\x48\x44\x68\x76\x5a',
        '\x42\x77\x76\x30\x79\x77\x58\x53\x41\x77\x6d',
        '\x79\x78\x62\x52',
        '\x43\x67\x66\x5a\x43\x32\x76\x4b',
        '\x34\x50\x32\x6d\x69\x65\x7a\x48\x41\x77\x58\x4c\x7a\x63\x62\x30\x42\x59\x62\x57\x43\x4d\x39\x4a\x7a\x78\x6e\x5a\x69\x67\x6e\x56\x42\x77\x31\x48\x42\x4d\x71\x48',
        '\x42\x32\x39\x4e\x44\x32\x66\x35\x6d\x47',
        '\x7a\x33\x6a\x56\x44\x78\x62\x6e\x7a\x78\x72\x48\x7a\x67\x66\x30\x79\x71',
        '\x42\x77\x76\x55\x44\x78\x6e\x4c\x44\x61',
        '\x43\x33\x72\x48\x43\x4e\x72\x5a\x76\x32\x4c\x30\x41\x61',
        '\x6d\x74\x4b\x58\x6e\x57',
        '\x43\x32\x76\x30\x42\x77\x76\x55\x44\x67\x4c\x56\x42\x47',
        '\x7a\x77\x35\x48\x79\x4d\x58\x4c\x7a\x61',
        '\x7a\x4d\x4c\x59\x7a\x71',
        '\x7a\x32\x4c\x30\x41\x68\x76\x49',
        '\x6b\x49\x62\x54\x42\x32\x72\x4c',
        '\x42\x4d\x76\x33\x43\x32\x58\x4c\x44\x68\x72\x4c\x43\x4b\x35\x48\x42\x77\x75',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x33\x7a\x77\x66\x30\x41\x67\x76\x59',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x33\x79\x78\x6a\x55\x41\x77\x35\x4e\x43\x57',
        '\x41\x32\x4c\x4a\x41\x57',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x48\x44\x78\x72\x56\x44\x68\x4c\x57\x41\x77\x35\x4e',
        '\x7a\x67\x66\x59\x7a\x71',
        '\x79\x32\x58\x4c\x79\x78\x6a\x30\x7a\x77\x31\x57',
        '\x44\x67\x76\x54\x43\x61',
        '\x6c\x49\x39\x53\x41\x77\x69\x56\x41\x78\x6e\x63\x79\x77\x35\x55\x7a\x77\x71',
        '\x44\x67\x39\x6d\x42\x33\x44\x4c\x43\x4b\x6e\x48\x43\x32\x75',
        '\x43\x32\x66\x55\x7a\x61',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4e\x41\x78\x72\x4f\x44\x77\x69',
        '\x43\x68\x76\x59\x43\x67\x58\x4c',
        '\x44\x4d\x4c\x4b\x7a\x77\x39\x6e\x7a\x78\x6e\x5a\x79\x77\x44\x4c',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4f\x79\x77\x35\x4e\x42\x77\x66\x55',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x41\x67\x66\x35\x79\x78\x6a\x50',
        '\x44\x33\x6a\x50\x44\x67\x76\x67\x41\x77\x58\x4c\x75\x33\x4c\x55\x79\x57',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x30\x42\x33\x62\x54\x7a\x77\x31\x49\x7a\x78\x6a\x5a',
        '\x43\x78\x76\x56\x44\x67\x75',
        '\x79\x4d\x44\x69\x7a\x78\x47',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x59\x7a\x78\x6e\x4c\x44\x67\x58\x50\x42\x4d\x53',
        '\x7a\x67\x66\x53\x42\x67\x75',
        '\x79\x77\x35\x30\x41\x77\x6e\x48\x42\x67\x57',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x41\x77\x31\x48\x7a\x32\x75',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x43\x67\x39\x30\x41\x77\x7a\x35',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x4b\x79\x78\x6a\x4c',
        '\x79\x4d\x58\x31\x43\x47',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x44\x67\x66\x4d\x7a\x47',
        '\x6f\x67\x6a\x48\x42\x67\x57',
        '\x6b\x4b\x6a\x56\x44\x63\x62\x54\x44\x78\x6e\x30\x69\x67\x6a\x4c\x69\x67\x66\x4b\x42\x77\x4c\x55\x69\x68\x72\x56\x69\x68\x76\x5a\x7a\x73\x62\x30\x41\x67\x4c\x5a\x69\x67\x7a\x4c\x79\x78\x72\x31\x43\x4d\x75\x51',
        '\x44\x77\x35\x53\x41\x77\x35\x52',
        '\x6c\x4d\x48\x50\x41\x4d\x66\x49',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x30\x79\x77\x54\x4c',
        '\x6c\x49\x39\x4b\x79\x78\x72\x48\x6c\x32\x31\x4c\x43\x33\x6e\x48\x7a\x32\x76\x64\x42\x33\x76\x55\x44\x63\x35\x51\x43\x32\x39\x55',
        '\x44\x32\x4c\x55\x41\x57',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x30\x41\x77\x54\x30\x42\x32\x53',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x5a\x7a\x78\x72\x30\x41\x77\x35\x4e\x43\x57',
        '\x43\x33\x72\x31\x43\x67\x4c\x4b',
        '\x63\x49\x61\x47\x38\x6a\x2b\x73\x52\x63\x62\x64\x41\x67\x66\x30\x69\x66\x72\x35\x43\x67\x75\x36\x69\x61',
        '\x42\x77\x76\x55\x44\x67\x4c\x56\x42\x4d\x76\x4b\x73\x4d\x4c\x4b',
        '\x41\x67\x4c\x51\x79\x77\x69',
        '\x43\x33\x76\x59\x43\x4d\x76\x55\x7a\x67\x76\x59',
        '\x6c\x49\x39\x4b\x79\x78\x7a\x4c\x43\x67\x58\x31\x7a\x32\x4c\x55\x43\x59\x39\x48\x44\x68\x72\x57'
    ];
    _0x2e80 = function () {
        return _0x48cbed;
    };
    return _0x2e80();
}
const tagCommand = require(_0x18db78(0x318));
const tagNotAdminCommand = require(_0x18db78(0x2a3));
const hideTagCommand = require(_0x18db78(0x289));
const jokeCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x6a\x6f\x6b\x65');
const quoteCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x71\x75\x6f\x74\x65');
const factCommand = require(_0x18db78(0x23d));
const weatherCommand = require(_0x18db78(0x34a));
const newsCommand = require(_0x18db78(0x260));
const kickCommand = require(_0x18db78(0x2a2));
const simageCommand = require(_0x18db78(0x360));
const attpCommand = require(_0x18db78(0x373));
const {complimentCommand} = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x63\x6f\x6d\x70\x6c\x69\x6d\x65\x6e\x74');
const {insultCommand} = require(_0x18db78(0x25b));
const {eightBallCommand} = require(_0x18db78(0x2c5));
const {lyricsCommand} = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x6c\x79\x72\x69\x63\x73');
const {dareCommand} = require(_0x18db78(0x362));
const {truthCommand} = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x74\x72\x75\x74\x68');
const {clearCommand} = require(_0x18db78(0x2a7));
const pingCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x70\x69\x6e\x67');
const aliveCommand = require(_0x18db78(0x258));
const blurCommand = require(_0x18db78(0x204));
const githubCommand = require(_0x18db78(0x354));
const antibadwordCommand = require(_0x18db78(0x200));
const takeCommand = require(_0x18db78(0x369));
const {flirtCommand} = require(_0x18db78(0x2fa));
const characterCommand = require(_0x18db78(0x1f5));
const wastedCommand = require(_0x18db78(0x335));
const shipCommand = require(_0x18db78(0x307));
function _0x1362(_0x169d2c, _0x14418e) {
    const _0x2e8039 = _0x2e80();
    _0x1362 = function (_0x136292, _0x443e8d) {
        _0x136292 = _0x136292 - 0x1e0;
        let _0x4c42c4 = _0x2e8039[_0x136292];
        if (_0x1362['\x6d\x78\x78\x6b\x4b\x57'] === undefined) {
            var _0x3e77de = function (_0x5680d9) {
                const _0x44d282 = '\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x2b\x2f\x3d';
                let _0x2d39f8 = '';
                let _0x5e0a99 = '';
                for (let _0x1610ca = 0x0, _0x308465, _0x28d19e, _0x4005c3 = 0x0; _0x28d19e = _0x5680d9['\x63\x68\x61\x72\x41\x74'](_0x4005c3++); ~_0x28d19e && (_0x308465 = _0x1610ca % 0x4 ? _0x308465 * 0x40 + _0x28d19e : _0x28d19e, _0x1610ca++ % 0x4) ? _0x2d39f8 += String['\x66\x72\x6f\x6d\x43\x68\x61\x72\x43\x6f\x64\x65'](0xff & _0x308465 >> (-0x2 * _0x1610ca & 0x6)) : 0x0) {
                    _0x28d19e = _0x44d282['\x69\x6e\x64\x65\x78\x4f\x66'](_0x28d19e);
                }
                for (let _0x1ea22e = 0x0, _0x5c17c7 = _0x2d39f8['\x6c\x65\x6e\x67\x74\x68']; _0x1ea22e < _0x5c17c7; _0x1ea22e++) {
                    _0x5e0a99 += '\x25' + ('\x30\x30' + _0x2d39f8['\x63\x68\x61\x72\x43\x6f\x64\x65\x41\x74'](_0x1ea22e)['\x74\x6f\x53\x74\x72\x69\x6e\x67'](0x10))['\x73\x6c\x69\x63\x65'](-0x2);
                }
                return decodeURIComponent(_0x5e0a99);
            };
            _0x1362['\x4c\x5a\x55\x4e\x68\x4a'] = _0x3e77de;
            _0x169d2c = arguments;
            _0x1362['\x6d\x78\x78\x6b\x4b\x57'] = !![];
        }
        const _0x4b45f8 = _0x2e8039[0x0];
        const _0x3e47c6 = _0x136292 + _0x4b45f8;
        const _0x55d083 = _0x169d2c[_0x3e47c6];
        if (!_0x55d083) {
            _0x4c42c4 = _0x1362['\x4c\x5a\x55\x4e\x68\x4a'](_0x4c42c4);
            _0x169d2c[_0x3e47c6] = _0x4c42c4;
        } else {
            _0x4c42c4 = _0x55d083;
        }
        return _0x4c42c4;
    };
    return _0x1362(_0x169d2c, _0x14418e);
}
const groupInfoCommand = require(_0x18db78(0x234));
const resetlinkCommand = require(_0x18db78(0x35d));
const staffCommand = require(_0x18db78(0x364));
const unbanCommand = require(_0x18db78(0x30a));
const emojimixCommand = require(_0x18db78(0x2d9));
const {handlePromotionEvent} = require(_0x18db78(0x287));
const {handleDemotionEvent} = require(_0x18db78(0x2c0));
const viewOnceCommand = require(_0x18db78(0x29f));
const clearSessionCommand = require(_0x18db78(0x224));
const {simpCommand} = require(_0x18db78(0x237));
const {stupidCommand} = require(_0x18db78(0x2bc));
const stickerTelegramCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x73\x74\x69\x63\x6b\x65\x72\x74\x65\x6c\x65\x67\x72\x61\x6d');
const textmakerCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x74\x65\x78\x74\x6d\x61\x6b\x65\x72');
const clearTmpCommand = require(_0x18db78(0x2f4));
const setProfilePicture = require(_0x18db78(0x1e0));
const instagramCommand = require(_0x18db78(0x324));
const facebookCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x66\x61\x63\x65\x62\x6f\x6f\x6b');
const spotifyCommand = require(_0x18db78(0x361));
const playCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x70\x6c\x61\x79');
const tiktokCommand = require(_0x18db78(0x36c));
const songCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x73\x6f\x6e\x67');
const aiCommand = require(_0x18db78(0x273));
const urlCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x75\x72\x6c');
const {handleTranslateCommand} = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x74\x72\x61\x6e\x73\x6c\x61\x74\x65');
const {handleSsCommand} = require(_0x18db78(0x29c));
const {goodnightCommand} = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x67\x6f\x6f\x64\x6e\x69\x67\x68\x74');
const {shayariCommand} = require(_0x18db78(0x358));
const {rosedayCommand} = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x72\x6f\x73\x65\x64\x61\x79');
const imagineCommand = require(_0x18db78(0x2be));
const videoCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x76\x69\x64\x65\x6f');
const sudoCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x73\x75\x64\x6f');
const {animeCommand} = require(_0x18db78(0x310));
const {piesCommand, piesAlias} = require(_0x18db78(0x280));
const stickercropCommand = require(_0x18db78(0x2e9));
const updateCommand = require(_0x18db78(0x283));
const removebgCommand = require(_0x18db78(0x1fe));
const {reminiCommand} = require(_0x18db78(0x216));
const {igsCommand} = require(_0x18db78(0x1ef));
const settingsCommand = require(_0x18db78(0x36d));
const soraCommand = require('\x2e\x2f\x64\x61\x76\x65\x70\x6c\x75\x67\x69\x6e\x73\x2f\x73\x6f\x72\x61');
const apkCommand = require(_0x18db78(0x28e));
const menuConfigCommand = require(_0x18db78(0x277));
global[_0x18db78(0x239)] = settings?.[_0x18db78(0x239)] || _0x18db78(0x296);
global[_0x18db78(0x29a)] = settings?.['\x61\x75\x74\x68\x6f\x72'] || _0x18db78(0x279);
global[_0x18db78(0x270)] = _0x18db78(0x268);
global['\x79\x74\x63\x68'] = _0x18db78(0x279);
const _0x44d282 = {};
_0x44d282[_0x18db78(0x2e3)] = '\x31\x32\x30\x33\x36\x33\x34\x30\x30\x34\x38\x30\x31\x37\x33\x32\x38\x30\x40\x6e\x65\x77\x73\x6c\x65\x74\x74\x65\x72';
_0x44d282[_0x18db78(0x349)] = _0x18db78(0x24c);
_0x44d282[_0x18db78(0x2bd)] = -0x1;
const _0x2d39f8 = {};
_0x2d39f8[_0x18db78(0x20d)] = 0x1;
_0x2d39f8[_0x18db78(0x2d5)] = !![];
_0x2d39f8[_0x18db78(0x30d)] = _0x44d282;
const _0x5e0a99 = {};
_0x5e0a99['\x63\x6f\x6e\x74\x65\x78\x74\x49\x6e\x66\x6f'] = _0x2d39f8;
const channelInfo = _0x5e0a99;
async function handleMessages(_0x57f7c2, _0x47f1ca, _0x13b45a) {
    const _0x16ee98 = _0x18db78;
    try {
        const {
            messages: _0x59ebeb,
            type: _0xc5aad5
        } = _0x47f1ca;
        if (_0xc5aad5 !== _0x16ee98(0x269))
            return;
        const _0x542caa = _0x59ebeb[0x0];
        if (!_0x542caa?.['\x6d\x65\x73\x73\x61\x67\x65'])
            return;
        await handleAutoread(_0x57f7c2, _0x542caa);
        if (_0x542caa[_0x16ee98(0x1f1)]) {
            storeMessage(_0x57f7c2, _0x542caa);
        }
        if (_0x542caa['\x6d\x65\x73\x73\x61\x67\x65']?.[_0x16ee98(0x24b)]?.['\x74\x79\x70\x65'] === 0x0) {
            await handleMessageRevocation(_0x57f7c2, _0x542caa);
            return;
        }
        const _0x274a22 = _0x542caa['\x6b\x65\x79'][_0x16ee98(0x2f6)];
        const _0x5ea224 = _0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x20a)] || _0x542caa['\x6b\x65\x79']['\x72\x65\x6d\x6f\x74\x65\x4a\x69\x64'];
        const _0x16eb4f = getPrefix();
        const _0x385918 = _0x274a22[_0x16ee98(0x217)](_0x16ee98(0x330));
        const _0x2f1ab4 = await isSudo(_0x5ea224);
        const _0x5d0a50 = (_0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x225)]?.['\x74\x72\x69\x6d']() || _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x1fd)]?.[_0x16ee98(0x205)]?.[_0x16ee98(0x24e)]() || _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x2dc)]?.[_0x16ee98(0x319)]?.[_0x16ee98(0x24e)]() || _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x356)]?.[_0x16ee98(0x319)]?.['\x74\x72\x69\x6d']() || '')[_0x16ee98(0x352)]()[_0x16ee98(0x328)](/\.\s+/g, '\x2e')['\x74\x72\x69\x6d']();
        const _0xa588d1 = _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x225)]?.[_0x16ee98(0x24e)]() || _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x1fd)]?.[_0x16ee98(0x205)]?.[_0x16ee98(0x24e)]() || _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x2dc)]?.[_0x16ee98(0x319)]?.['\x74\x72\x69\x6d']() || _0x542caa['\x6d\x65\x73\x73\x61\x67\x65']?.[_0x16ee98(0x356)]?.[_0x16ee98(0x319)]?.['\x74\x72\x69\x6d']() || '';
        if (_0x5d0a50) {
            _0x57f7c2[_0x16ee98(0x278)] = _0x422a98 => {
                const _0x2561be = _0x16ee98;
                if (!_0x422a98)
                    return _0x422a98;
                if (/:\d+@/gi[_0x2561be(0x2b4)](_0x422a98)) {
                    let _0x2a5177 = jidDecode(_0x422a98) || {};
                    return _0x2a5177[_0x2561be(0x1ff)] && _0x2a5177[_0x2561be(0x2d3)] ? _0x2a5177['\x75\x73\x65\x72'] + '\x40' + _0x2a5177['\x73\x65\x72\x76\x65\x72'] : _0x422a98;
                } else
                    return _0x422a98;
            };
            const _0xe07961 = _0x385918 ? await _0x57f7c2[_0x16ee98(0x340)](_0x274a22)['\x63\x61\x74\x63\x68'](() => ({})) : {};
            const _0x4e892c = _0x57f7c2['\x64\x65\x63\x6f\x64\x65\x4a\x69\x64'](_0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x2f6)]);
            const _0x40e001 = _0x57f7c2[_0x16ee98(0x278)](_0x542caa['\x6b\x65\x79']['\x70\x61\x72\x74\x69\x63\x69\x70\x61\x6e\x74'] || _0x4e892c);
            const _0x1c4edc = _0x542caa[_0x16ee98(0x1f1)]['\x63\x6f\x6e\x76\x65\x72\x73\x61\x74\x69\x6f\x6e'] || _0x542caa['\x6d\x65\x73\x73\x61\x67\x65']['\x65\x78\x74\x65\x6e\x64\x65\x64\x54\x65\x78\x74\x4d\x65\x73\x73\x61\x67\x65']?.[_0x16ee98(0x205)] || '';
            const _0x2d8495 = _0x542caa['\x70\x75\x73\x68\x4e\x61\x6d\x65'] || '\x55\x6e\x6b\x6e\x6f\x77\x6e\x20\x55\x73\x65\x72';
            const _0x1d6cfc = _0x274a22[_0x16ee98(0x217)](_0x16ee98(0x330)) ? _0x16ee98(0x27e) : _0x16ee98(0x1f9);
            const _0x1639c7 = _0x1d6cfc === _0x16ee98(0x27e) ? _0xe07961?.[_0x16ee98(0x2d1)] || _0x16ee98(0x2e2) : _0x2d8495;
            const _0x42a246 = new Date()[_0x16ee98(0x20b)]();
            console['\x6c\x6f\x67'](chalk[_0x16ee98(0x35c)]('\x23\x31\x32\x31\x32\x31\x32')['\x62\x6c\x75\x65'][_0x16ee98(0x292)]('\x0a\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\x0a\x20\x20\ud83d\udce5\x20\x49\x4e\x43\x4f\x4d\x49\x4e\x47\x20\x4d\x45\x53\x53\x41\x47\x45\x3a\x20' + _0x42a246 + '\x0a\x20\x20\ud83d\udc64\x20\x46\x72\x6f\x6d\x3a\x20' + _0x2d8495 + '\x3a\x20' + _0x40e001 + _0x16ee98(0x36f) + _0x1d6cfc + '\x3a\x20' + _0x1639c7 + _0x16ee98(0x303) + (_0x1c4edc || '\u2014') + _0x16ee98(0x315)));
        }
        try {
            const _0x5d6781 = JSON['\x70\x61\x72\x73\x65'](fs[_0x16ee98(0x219)](_0x16ee98(0x36a)));
            if (!_0x5d6781[_0x16ee98(0x333)] && !_0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x264)] && !_0x2f1ab4) {
                return;
            }
        } catch (_0x5b92d4) {
            console['\x65\x72\x72\x6f\x72']('\x45\x72\x72\x6f\x72\x20\x63\x68\x65\x63\x6b\x69\x6e\x67\x20\x61\x63\x63\x65\x73\x73\x20\x6d\x6f\x64\x65\x3a', _0x5b92d4);
        }
        if (isBanned(_0x5ea224) && !_0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x75\x6e\x62\x61\x6e')) {
            if (Math[_0x16ee98(0x30f)]() < 0.1) {
                const _0xe3bcf2 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x30b),
                    ...channelInfo
                };
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0xe3bcf2);
            }
            return;
        }
        if (/^[1-9]$/[_0x16ee98(0x2b4)](_0x5d0a50) || _0x5d0a50['\x74\x6f\x4c\x6f\x77\x65\x72\x43\x61\x73\x65']() === _0x16ee98(0x372)) {
            await handleTicTacToeMove(_0x57f7c2, _0x274a22, _0x5ea224, _0x5d0a50);
            return;
        }
        if (!_0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x264)])
            incrementMessageCount(_0x274a22, _0x5ea224);
        if (_0x385918 && _0x5d0a50) {
            await handleBadwordDetection(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x5ea224);
            await Antilink(_0x542caa, _0x57f7c2);
        }
        if (!_0x385918 && !_0x542caa[_0x16ee98(0x2e0)]['\x66\x72\x6f\x6d\x4d\x65'] && !_0x2f1ab4) {
            try {
                const _0x4e70b9 = readPmBlockerState();
                if (_0x4e70b9[_0x16ee98(0x345)]) {
                    const _0x7a3f71 = {};
                    _0x7a3f71[_0x16ee98(0x205)] = _0x4e70b9[_0x16ee98(0x1f1)] || _0x16ee98(0x271);
                    await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x7a3f71);
                    await new Promise(_0xe250e8 => setTimeout(_0xe250e8, 0x5dc));
                    try {
                        await _0x57f7c2['\x75\x70\x64\x61\x74\x65\x42\x6c\x6f\x63\x6b\x53\x74\x61\x74\x75\x73'](_0x274a22, '\x62\x6c\x6f\x63\x6b');
                    } catch (_0x152be7) {
                    }
                    return;
                }
            } catch (_0x34d89c) {
            }
        }
        if (!_0x5d0a50[_0x16ee98(0x342)](_0x16eb4f)) {
            await handleAutotypingForMessage(_0x57f7c2, _0x274a22, _0x5d0a50);
            if (_0x385918) {
                await handleChatbotResponse(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x5ea224);
                await handleTagDetection(_0x57f7c2, _0x274a22, _0x542caa, _0x5ea224);
                await handleMentionDetection(_0x57f7c2, _0x274a22, _0x542caa);
            }
            return;
        }
        const _0x7180b6 = [
            _0x16eb4f + '\x6d\x75\x74\x65',
            _0x16eb4f + '\x75\x6e\x6d\x75\x74\x65',
            _0x16eb4f + _0x16ee98(0x238),
            _0x16eb4f + _0x16ee98(0x2f7),
            _0x16eb4f + _0x16ee98(0x240),
            _0x16eb4f + _0x16ee98(0x2de),
            _0x16eb4f + _0x16ee98(0x34c),
            _0x16eb4f + _0x16ee98(0x290),
            _0x16eb4f + _0x16ee98(0x26f),
            _0x16eb4f + _0x16ee98(0x20f),
            _0x16eb4f + _0x16ee98(0x207),
            _0x16eb4f + _0x16ee98(0x2d0),
            _0x16eb4f + '\x73\x65\x74\x67\x64\x65\x73\x63',
            _0x16eb4f + _0x16ee98(0x312),
            _0x16eb4f + _0x16ee98(0x2ab)
        ];
        const _0x4f8c6f = _0x7180b6[_0x16ee98(0x2ea)](_0x298c14 => _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x298c14));
        const _0x200558 = [
            _0x16eb4f + _0x16ee98(0x2a0),
            _0x16eb4f + _0x16ee98(0x337),
            _0x16eb4f + '\x61\x6e\x74\x69\x64\x65\x6c\x65\x74\x65',
            _0x16eb4f + _0x16ee98(0x332),
            _0x16eb4f + '\x73\x65\x74\x70\x70',
            _0x16eb4f + _0x16ee98(0x256),
            _0x16eb4f + _0x16ee98(0x32a),
            _0x16eb4f + _0x16ee98(0x2b9),
            _0x16eb4f + _0x16ee98(0x222),
            _0x16eb4f + _0x16ee98(0x2fb),
            _0x16eb4f + '\x70\x6d\x62\x6c\x6f\x63\x6b\x65\x72'
        ];
        const _0x2ed55c = _0x200558[_0x16ee98(0x2ea)](_0x28617e => _0x5d0a50[_0x16ee98(0x342)](_0x28617e));
        let _0x132bf2 = ![];
        let _0xbf7d5 = ![];
        if (_0x385918 && _0x4f8c6f) {
            const _0x138609 = await isAdmin(_0x57f7c2, _0x274a22, _0x5ea224, _0x542caa);
            _0x132bf2 = _0x138609[_0x16ee98(0x25d)];
            _0xbf7d5 = _0x138609[_0x16ee98(0x2fc)];
            if (!_0xbf7d5) {
                const _0x381a6d = {
                    '\x74\x65\x78\x74': _0x16ee98(0x2d4),
                    ...channelInfo
                };
                const _0x367d15 = {};
                _0x367d15[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x381a6d, _0x367d15);
                return;
            }
            if (_0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x23a)) || _0x5d0a50 === _0x16eb4f + _0x16ee98(0x2fd) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x238)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x75\x6e\x62\x61\x6e') || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x240)) || _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x2de))) {
                if (!_0x132bf2 && !_0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x264)]) {
                    const _0x1088f2 = {
                        '\x74\x65\x78\x74': _0x16ee98(0x32e),
                        ...channelInfo
                    };
                    const _0x1d2a3f = {};
                    _0x1d2a3f[_0x16ee98(0x2a9)] = _0x542caa;
                    await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x1088f2, _0x1d2a3f);
                    return;
                }
            }
        }
        if (_0x2ed55c) {
            if (!_0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x264)] && !_0x2f1ab4) {
                const _0x466784 = {};
                _0x466784[_0x16ee98(0x205)] = _0x16ee98(0x22d);
                const _0x3426fb = {};
                _0x3426fb[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x466784, _0x3426fb);
                return;
            }
        }
        let _0x2f2caf = ![];
        switch (!![]) {
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x26b)):
            await handleSetPrefixCommand(_0x57f7c2, _0x274a22, _0x5ea224, _0x542caa, _0x5d0a50, _0x16eb4f);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2e7)):
            await handleSetOwnerCommand(_0x57f7c2, _0x274a22, _0x5ea224, _0x542caa, _0x5d0a50, _0x16eb4f);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x314):
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x2c9): {
                const _0x1954a6 = _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x1fd)]?.[_0x16ee98(0x323)]?.[_0x16ee98(0x27a)];
                if (_0x1954a6?.[_0x16ee98(0x265)]) {
                    await simageCommand(_0x57f7c2, _0x1954a6, _0x274a22);
                } else {
                    const _0x2d8fa8 = {
                        '\x74\x65\x78\x74': _0x16ee98(0x220),
                        ...channelInfo
                    };
                    const _0x4f8bd4 = {};
                    _0x4f8bd4[_0x16ee98(0x2a9)] = _0x542caa;
                    await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x2d8fa8, _0x4f8bd4);
                }
                _0x2f2caf = !![];
                break;
            }
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x34c)):
            const _0x3c9fb4 = _0x542caa['\x6d\x65\x73\x73\x61\x67\x65'][_0x16ee98(0x1fd)]?.[_0x16ee98(0x323)]?.['\x6d\x65\x6e\x74\x69\x6f\x6e\x65\x64\x4a\x69\x64'] || [];
            await kickCommand(_0x57f7c2, _0x274a22, _0x5ea224, _0x3c9fb4, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x23a)): {
                const _0x3bf3f8 = _0x5d0a50[_0x16ee98(0x24e)]()['\x73\x70\x6c\x69\x74'](/\s+/);
                const _0x1d54f6 = _0x3bf3f8[0x1];
                const _0x4647b9 = _0x1d54f6 !== undefined ? parseInt(_0x1d54f6, 0xa) : undefined;
                if (_0x1d54f6 !== undefined && (isNaN(_0x4647b9) || _0x4647b9 <= 0x0)) {
                    const _0x1b0cfb = {};
                    _0x1b0cfb[_0x16ee98(0x205)] = '\x50\x6c\x65\x61\x73\x65\x20\x70\x72\x6f\x76\x69\x64\x65\x20\x61\x20\x76\x61\x6c\x69\x64\x20\x6e\x75\x6d\x62\x65\x72\x20\x6f\x66\x20\x6d\x69\x6e\x75\x74\x65\x73\x20\x6f\x72\x20\x75\x73\x65\x20\x2e\x6d\x75\x74\x65\x20\x77\x69\x74\x68\x20\x6e\x6f\x20\x6e\x75\x6d\x62\x65\x72\x20\x74\x6f\x20\x6d\x75\x74\x65\x20\x69\x6d\x6d\x65\x64\x69\x61\x74\x65\x6c\x79\x2e';
                    const _0x136b49 = {};
                    _0x136b49[_0x16ee98(0x2a9)] = _0x542caa;
                    await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x1b0cfb, _0x136b49);
                } else {
                    await muteCommand(_0x57f7c2, _0x274a22, _0x5ea224, _0x542caa, _0x4647b9);
                }
            }
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x2fd):
            await unmuteCommand(_0x57f7c2, _0x274a22, _0x5ea224);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x238)):
            await banCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2f7)):
            await unbanCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x28c) || _0x5d0a50 === _0x16eb4f + _0x16ee98(0x1e2) || _0x5d0a50 === _0x16eb4f + _0x16ee98(0x28b):
            await helpCommand(_0x57f7c2, _0x274a22, _0x542caa);
            _0x2f2caf = !![];
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x245)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x341)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x275)):
            const _0x29f549 = _0x5d0a50[_0x16ee98(0x257)]('\x20')[_0x16ee98(0x2cc)](0x1);
            await menuConfigCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x29f549);
            _0x2f2caf = !![];
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x31a) || _0x5d0a50 === _0x16eb4f + '\x73':
            await stickerCommand(_0x57f7c2, _0x274a22, _0x542caa);
            _0x2f2caf = !![];
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2f1)):
            const _0x44dcab = _0x542caa['\x6d\x65\x73\x73\x61\x67\x65']['\x65\x78\x74\x65\x6e\x64\x65\x64\x54\x65\x78\x74\x4d\x65\x73\x73\x61\x67\x65']?.[_0x16ee98(0x323)]?.[_0x16ee98(0x370)] || [];
            await warningsCommand(_0x57f7c2, _0x274a22, _0x44dcab);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x320)):
            const _0xc34a54 = _0x542caa[_0x16ee98(0x1f1)][_0x16ee98(0x1fd)]?.['\x63\x6f\x6e\x74\x65\x78\x74\x49\x6e\x66\x6f']?.[_0x16ee98(0x370)] || [];
            await warnCommand(_0x57f7c2, _0x274a22, _0x5ea224, _0xc34a54, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x21f)):
            const _0x4f083f = _0x5d0a50[_0x16ee98(0x2cc)]((_0x16eb4f + _0x16ee98(0x21f))[_0x16ee98(0x24f)])[_0x16ee98(0x24e)]();
            await ttsCommand(_0x57f7c2, _0x274a22, _0x4f083f, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x223)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x281)):
            await deleteCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5ea224);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x1f3)):
            await attpCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x33c)):
            await apkCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x2ef):
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x2b2):
            await settingsCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2a0)):
            if (!_0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x264)] && !_0x2f1ab4) {
                const _0x39857f = {};
                _0x39857f[_0x16ee98(0x205)] = _0x16ee98(0x253);
                const _0x2540c5 = {};
                _0x2540c5[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x39857f, _0x2540c5);
                return;
            }
            let _0x4ec45d;
            try {
                _0x4ec45d = JSON[_0x16ee98(0x25f)](fs[_0x16ee98(0x219)](_0x16ee98(0x36a)));
            } catch (_0x5b0697) {
                console[_0x16ee98(0x212)](_0x16ee98(0x21d), _0x5b0697);
                const _0x23e978 = {
                    '\x74\x65\x78\x74': '\x46\x61\x69\x6c\x65\x64\x20\x74\x6f\x20\x72\x65\x61\x64\x20\x62\x6f\x74\x20\x6d\x6f\x64\x65\x20\x73\x74\x61\x74\x75\x73',
                    ...channelInfo
                };
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x23e978);
                return;
            }
            const _0x29d4ef = _0x5d0a50[_0x16ee98(0x257)]('\x20')[0x1]?.[_0x16ee98(0x352)]();
            if (!_0x29d4ef) {
                const _0x4eca27 = _0x4ec45d[_0x16ee98(0x333)] ? _0x16ee98(0x2e8) : _0x16ee98(0x20c);
                const _0x19e40e = {};
                _0x19e40e['\x74\x65\x78\x74'] = _0x16ee98(0x263) + _0x4eca27 + _0x16ee98(0x249) + _0x16eb4f + _0x16ee98(0x2f8) + _0x16eb4f + _0x16ee98(0x2a1) + _0x16eb4f + _0x16ee98(0x2a5);
                const _0x3874df = {};
                _0x3874df[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x19e40e, _0x3874df);
                return;
            }
            if (_0x29d4ef !== _0x16ee98(0x2e8) && _0x29d4ef !== _0x16ee98(0x20c)) {
                const _0x36b568 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x21a) + _0x16eb4f + '\x6d\x6f\x64\x65\x20\x70\x75\x62\x6c\x69\x63\x2f\x70\x72\x69\x76\x61\x74\x65\x0a\x0a\x45\x78\x61\x6d\x70\x6c\x65\x3a\x0a' + _0x16eb4f + _0x16ee98(0x2a1) + _0x16eb4f + '\x6d\x6f\x64\x65\x20\x70\x72\x69\x76\x61\x74\x65\x20\x2d\x20\x52\x65\x73\x74\x72\x69\x63\x74\x20\x74\x6f\x20\x6f\x77\x6e\x65\x72\x20\x6f\x6e\x6c\x79',
                    ...channelInfo
                };
                const _0x3ca34b = {};
                _0x3ca34b[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2['\x73\x65\x6e\x64\x4d\x65\x73\x73\x61\x67\x65'](_0x274a22, _0x36b568, _0x3ca34b);
                return;
            }
            try {
                _0x4ec45d[_0x16ee98(0x333)] = _0x29d4ef === '\x70\x75\x62\x6c\x69\x63';
                fs[_0x16ee98(0x359)]('\x2e\x2f\x64\x61\x74\x61\x2f\x6d\x65\x73\x73\x61\x67\x65\x43\x6f\x75\x6e\x74\x2e\x6a\x73\x6f\x6e', JSON[_0x16ee98(0x2b3)](_0x4ec45d, null, 0x2));
                const _0x22da22 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x214) + _0x29d4ef + _0x16ee98(0x348),
                    ...channelInfo
                };
                await _0x57f7c2['\x73\x65\x6e\x64\x4d\x65\x73\x73\x61\x67\x65'](_0x274a22, _0x22da22);
            } catch (_0xc0cedd) {
                console[_0x16ee98(0x212)](_0x16ee98(0x23f), _0xc0cedd);
                const _0x1061af = {
                    '\x74\x65\x78\x74': _0x16ee98(0x2a8),
                    ...channelInfo
                };
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x1061af);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x35f)):
            if (!_0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x264)] && !_0x2f1ab4) {
                const _0x1a6285 = {};
                _0x1a6285[_0x16ee98(0x205)] = _0x16ee98(0x24a);
                const _0x189ef1 = {};
                _0x189ef1[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x1a6285, _0x189ef1);
                break;
            }
            {
                const _0x5d5623 = _0x5d0a50[_0x16ee98(0x257)]('\x20')['\x73\x6c\x69\x63\x65'](0x1)['\x6a\x6f\x69\x6e']('\x20');
                await anticallCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d5623);
            }
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x1fa)):
            if (!_0x542caa['\x6b\x65\x79'][_0x16ee98(0x264)] && !_0x2f1ab4) {
                const _0x47d4e9 = {};
                _0x47d4e9[_0x16ee98(0x205)] = _0x16ee98(0x2c6);
                const _0x390adb = {};
                _0x390adb[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2['\x73\x65\x6e\x64\x4d\x65\x73\x73\x61\x67\x65'](_0x274a22, _0x47d4e9, _0x390adb);
                _0x2f2caf = !![];
                break;
            }
            {
                const _0x44eb67 = _0x5d0a50[_0x16ee98(0x257)]('\x20')[_0x16ee98(0x2cc)](0x1)['\x6a\x6f\x69\x6e']('\x20');
                await pmblockerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x44eb67);
            }
            _0x2f2caf = !![];
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x28f):
            await ownerCommand(_0x57f7c2, _0x274a22);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x290):
            if (_0x132bf2 || _0x542caa[_0x16ee98(0x2e0)]['\x66\x72\x6f\x6d\x4d\x65']) {
                await tagAllCommand(_0x57f7c2, _0x274a22, _0x5ea224, _0x542caa);
            } else {
                const _0x4910a6 = {
                    '\x74\x65\x78\x74': '\x53\x6f\x72\x72\x79\x2c\x20\x6f\x6e\x6c\x79\x20\x67\x72\x6f\x75\x70\x20\x61\x64\x6d\x69\x6e\x73\x20\x63\x61\x6e\x20\x75\x73\x65\x20\x74\x68\x65\x20\x74\x61\x67\x61\x6c\x6c\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x2e',
                    ...channelInfo
                };
                const _0x409af2 = {};
                _0x409af2[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x4910a6, _0x409af2);
            }
            break;
        case _0x5d0a50 === _0x16eb4f + '\x74\x61\x67\x6e\x6f\x74\x61\x64\x6d\x69\x6e':
            await tagNotAdminCommand(_0x57f7c2, _0x274a22, _0x5ea224, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x20f)): {
                const _0x2c65c8 = _0xa588d1['\x73\x6c\x69\x63\x65']((_0x16eb4f + _0x16ee98(0x20f))[_0x16ee98(0x24f)])[_0x16ee98(0x24e)]();
                const _0xdc47e6 = _0x542caa[_0x16ee98(0x1f1)]?.['\x65\x78\x74\x65\x6e\x64\x65\x64\x54\x65\x78\x74\x4d\x65\x73\x73\x61\x67\x65']?.[_0x16ee98(0x323)]?.[_0x16ee98(0x27a)] || null;
                await hideTagCommand(_0x57f7c2, _0x274a22, _0x5ea224, _0x2c65c8, _0xdc47e6, _0x542caa);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x301)):
            const _0x4fb7e4 = _0xa588d1[_0x16ee98(0x2cc)]((_0x16eb4f + _0x16ee98(0x301))['\x6c\x65\x6e\x67\x74\x68'])[_0x16ee98(0x24e)]();
            const _0x493b3f = _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x1fd)]?.['\x63\x6f\x6e\x74\x65\x78\x74\x49\x6e\x66\x6f']?.['\x71\x75\x6f\x74\x65\x64\x4d\x65\x73\x73\x61\x67\x65'] || null;
            await tagCommand(_0x57f7c2, _0x274a22, _0x5ea224, _0x4fb7e4, _0x493b3f, _0x542caa);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x207)):
            if (!_0x385918) {
                const _0x3070a0 = {
                    '\x74\x65\x78\x74': '\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x63\x61\x6e\x20\x6f\x6e\x6c\x79\x20\x62\x65\x20\x75\x73\x65\x64\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x2e',
                    ...channelInfo
                };
                const _0x54a9ad = {};
                _0x54a9ad[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x3070a0, _0x54a9ad);
                return;
            }
            if (!_0xbf7d5) {
                const _0x396ad8 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x2c7),
                    ...channelInfo
                };
                const _0x372930 = {};
                _0x372930[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x396ad8, _0x372930);
                return;
            }
            await handleAntilinkCommand(_0x57f7c2, _0x274a22, _0x5d0a50, _0x5ea224, _0x132bf2, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2d0)):
            if (!_0x385918) {
                const _0x33757a = {
                    '\x74\x65\x78\x74': '\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x63\x61\x6e\x20\x6f\x6e\x6c\x79\x20\x62\x65\x20\x75\x73\x65\x64\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x2e',
                    ...channelInfo
                };
                const _0x3f1e0f = {};
                _0x3f1e0f[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x33757a, _0x3f1e0f);
                return;
            }
            if (!_0xbf7d5) {
                const _0x4fe276 = {
                    '\x74\x65\x78\x74': '\x50\x6c\x65\x61\x73\x65\x20\x6d\x61\x6b\x65\x20\x74\x68\x65\x20\x62\x6f\x74\x20\x61\x6e\x20\x61\x64\x6d\x69\x6e\x20\x66\x69\x72\x73\x74\x2e',
                    ...channelInfo
                };
                const _0x38dfdb = {};
                _0x38dfdb[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x4fe276, _0x38dfdb);
                return;
            }
            await handleAntitagCommand(_0x57f7c2, _0x274a22, _0x5d0a50, _0x5ea224, _0x132bf2, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x2c4):
            await memeCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x274):
            await jokeCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x35b):
            await quoteCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + '\x66\x61\x63\x74':
            await factCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x542caa);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x30c)):
            const _0x5bd540 = _0x5d0a50['\x73\x6c\x69\x63\x65']((_0x16eb4f + _0x16ee98(0x30c))[_0x16ee98(0x24f)])['\x74\x72\x69\x6d']();
            if (_0x5bd540) {
                await weatherCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5bd540);
            } else {
                const _0x15fbdd = {
                    '\x74\x65\x78\x74': _0x16ee98(0x321) + _0x16eb4f + _0x16ee98(0x259),
                    ...channelInfo
                };
                const _0x37cfc6 = {};
                _0x37cfc6[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x15fbdd, _0x37cfc6);
            }
            break;
        case _0x5d0a50 === _0x16eb4f + '\x6e\x65\x77\x73':
            await newsCommand(_0x57f7c2, _0x274a22);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2ae)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x74\x69\x63\x74\x61\x63\x74\x6f\x65'):
            const _0x4bb629 = _0x5d0a50[_0x16ee98(0x257)]('\x20')[_0x16ee98(0x2cc)](0x1)[_0x16ee98(0x27d)]('\x20');
            await tictactoeCommand(_0x57f7c2, _0x274a22, _0x5ea224, _0x4bb629);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x26e)):
            const _0x224c75 = parseInt(_0x5d0a50[_0x16ee98(0x257)]('\x20')[0x1]);
            if (isNaN(_0x224c75)) {
                const _0x3ba742 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x27f),
                    ...channelInfo
                };
                const _0x20aa5d = {};
                _0x20aa5d[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x3ba742, _0x20aa5d);
            } else {
                await handleTicTacToeMove(_0x57f7c2, _0x274a22, _0x5ea224, _0x224c75['\x74\x6f\x53\x74\x72\x69\x6e\x67']());
            }
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x261):
            topMembers(_0x57f7c2, _0x274a22, _0x385918);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x1e7)):
            startHangman(_0x57f7c2, _0x274a22);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x1f8)):
            const _0x426f9c = _0x5d0a50['\x73\x70\x6c\x69\x74']('\x20')[0x1];
            if (_0x426f9c) {
                guessLetter(_0x57f7c2, _0x274a22, _0x426f9c);
            } else {
                const _0x2a98f7 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x2aa) + _0x16eb4f + _0x16ee98(0x2f5),
                    ...channelInfo
                };
                const _0x568717 = {};
                _0x568717[_0x16ee98(0x2a9)] = _0x542caa;
                _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x2a98f7, _0x568717);
            }
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x74\x72\x69\x76\x69\x61'):
            startTrivia(_0x57f7c2, _0x274a22);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x1f2)):
            const _0x1ceda1 = _0x5d0a50[_0x16ee98(0x257)]('\x20')['\x73\x6c\x69\x63\x65'](0x1)['\x6a\x6f\x69\x6e']('\x20');
            if (_0x1ceda1) {
                answerTrivia(_0x57f7c2, _0x274a22, _0x1ceda1);
            } else {
                const _0x33c7d0 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x308) + _0x16eb4f + _0x16ee98(0x2ee),
                    ...channelInfo
                };
                const _0x1e65ce = {};
                _0x1e65ce[_0x16ee98(0x2a9)] = _0x542caa;
                _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x33c7d0, _0x1e65ce);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x63\x6f\x6d\x70\x6c\x69\x6d\x65\x6e\x74'):
            await complimentCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x2bf)):
            await insultCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x365)):
            const _0x35cbc3 = _0x5d0a50[_0x16ee98(0x257)]('\x20')['\x73\x6c\x69\x63\x65'](0x1)[_0x16ee98(0x27d)]('\x20');
            await eightBallCommand(_0x57f7c2, _0x274a22, _0x35cbc3);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x218)):
            const _0x498dc6 = _0x5d0a50[_0x16ee98(0x257)]('\x20')[_0x16ee98(0x2cc)](0x1)[_0x16ee98(0x27d)]('\x20');
            await lyricsCommand(_0x57f7c2, _0x274a22, _0x498dc6, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x284)):
            const _0x21aef9 = _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x1fd)]?.['\x63\x6f\x6e\x74\x65\x78\x74\x49\x6e\x66\x6f']?.[_0x16ee98(0x27a)];
            const _0x128d0b = _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x1fd)]?.[_0x16ee98(0x323)]?.[_0x16ee98(0x370)] || [];
            await simpCommand(_0x57f7c2, _0x274a22, _0x21aef9, _0x128d0b, _0x5ea224);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x36e)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x297)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x311)):
            const _0x4950fb = _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x1fd)]?.['\x63\x6f\x6e\x74\x65\x78\x74\x49\x6e\x66\x6f']?.[_0x16ee98(0x27a)];
            const _0x25b93f = _0x542caa[_0x16ee98(0x1f1)]?.[_0x16ee98(0x1fd)]?.['\x63\x6f\x6e\x74\x65\x78\x74\x49\x6e\x66\x6f']?.[_0x16ee98(0x370)] || [];
            const _0x313215 = _0x5d0a50[_0x16ee98(0x257)]('\x20')['\x73\x6c\x69\x63\x65'](0x1);
            await stupidCommand(_0x57f7c2, _0x274a22, _0x4950fb, _0x25b93f, _0x5ea224, _0x313215);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x34e):
            await dareCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x309):
            await truthCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x1ea):
            if (_0x385918)
                await clearCommand(_0x57f7c2, _0x274a22);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x240)):
            const _0x1d2fe1 = _0x542caa[_0x16ee98(0x1f1)][_0x16ee98(0x1fd)]?.[_0x16ee98(0x323)]?.['\x6d\x65\x6e\x74\x69\x6f\x6e\x65\x64\x4a\x69\x64'] || [];
            await promoteCommand(_0x57f7c2, _0x274a22, _0x1d2fe1, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2de)):
            const _0x41935c = _0x542caa[_0x16ee98(0x1f1)][_0x16ee98(0x1fd)]?.[_0x16ee98(0x323)]?.[_0x16ee98(0x370)] || [];
            await demoteCommand(_0x57f7c2, _0x274a22, _0x41935c, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x338):
            await pingCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x293):
            await getppCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x298):
            await aliveCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x6d\x65\x6e\x74\x69\x6f\x6e'): {
                const _0x448196 = _0x5d0a50[_0x16ee98(0x257)]('\x20')[_0x16ee98(0x2cc)](0x1)[_0x16ee98(0x27d)]('\x20');
                const _0x19ef3c = _0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x264)] || _0x2f1ab4;
                await mentionToggleCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x448196, _0x19ef3c);
            }
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x344): {
                const _0x578dd8 = _0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x264)] || _0x2f1ab4;
                await setMentionCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x578dd8);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x363)):
            const _0x45cca = _0x542caa['\x6d\x65\x73\x73\x61\x67\x65']?.[_0x16ee98(0x1fd)]?.[_0x16ee98(0x323)]?.[_0x16ee98(0x27a)];
            await blurCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x45cca);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x32b)):
            if (_0x385918) {
                if (!_0x132bf2) {
                    const _0x5c19fe = await isAdmin(_0x57f7c2, _0x274a22, _0x5ea224);
                    _0x132bf2 = _0x5c19fe['\x69\x73\x53\x65\x6e\x64\x65\x72\x41\x64\x6d\x69\x6e'];
                }
                if (_0x132bf2 || _0x542caa['\x6b\x65\x79'][_0x16ee98(0x264)]) {
                    await welcomeCommand(_0x57f7c2, _0x274a22, _0x542caa);
                } else {
                    const _0x1a6511 = {
                        '\x74\x65\x78\x74': '\x53\x6f\x72\x72\x79\x2c\x20\x6f\x6e\x6c\x79\x20\x67\x72\x6f\x75\x70\x20\x61\x64\x6d\x69\x6e\x73\x20\x63\x61\x6e\x20\x75\x73\x65\x20\x74\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x2e',
                        ...channelInfo
                    };
                    const _0x3db0b8 = {};
                    _0x3db0b8[_0x16ee98(0x2a9)] = _0x542caa;
                    await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x1a6511, _0x3db0b8);
                }
            } else {
                const _0x334c57 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x28d),
                    ...channelInfo
                };
                const _0xc901eb = {};
                _0xc901eb[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x334c57, _0xc901eb);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x67\x6f\x6f\x64\x62\x79\x65'):
            if (_0x385918) {
                if (!_0x132bf2) {
                    const _0x366e98 = await isAdmin(_0x57f7c2, _0x274a22, _0x5ea224);
                    _0x132bf2 = _0x366e98[_0x16ee98(0x25d)];
                }
                if (_0x132bf2 || _0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x264)]) {
                    await goodbyeCommand(_0x57f7c2, _0x274a22, _0x542caa);
                } else {
                    const _0x170f7d = {
                        '\x74\x65\x78\x74': _0x16ee98(0x32e),
                        ...channelInfo
                    };
                    const _0x1a9967 = {};
                    _0x1a9967[_0x16ee98(0x2a9)] = _0x542caa;
                    await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x170f7d, _0x1a9967);
                }
            } else {
                const _0x13dc85 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x28d),
                    ...channelInfo
                };
                const _0x391b0a = {};
                _0x391b0a[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2['\x73\x65\x6e\x64\x4d\x65\x73\x73\x61\x67\x65'](_0x274a22, _0x13dc85, _0x391b0a);
            }
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x221):
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x347):
        case _0x5d0a50 === _0x16eb4f + '\x73\x63':
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x2c3):
        case _0x5d0a50 === _0x16eb4f + '\x72\x65\x70\x6f':
            await githubCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x201)):
            if (!_0x385918) {
                const _0x110f9a = {
                    '\x74\x65\x78\x74': _0x16ee98(0x28d),
                    ...channelInfo
                };
                const _0x175500 = {};
                _0x175500[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x110f9a, _0x175500);
                return;
            }
            const _0x1c590c = await isAdmin(_0x57f7c2, _0x274a22, _0x5ea224);
            _0x132bf2 = _0x1c590c[_0x16ee98(0x25d)];
            _0xbf7d5 = _0x1c590c[_0x16ee98(0x2fc)];
            if (!_0xbf7d5) {
                const _0x4c6c3b = {
                    '\x74\x65\x78\x74': _0x16ee98(0x366),
                    ...channelInfo
                };
                const _0x137c4d = {};
                _0x137c4d[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2['\x73\x65\x6e\x64\x4d\x65\x73\x73\x61\x67\x65'](_0x274a22, _0x4c6c3b, _0x137c4d);
                return;
            }
            await antibadwordCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5ea224, _0x132bf2);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x63\x68\x61\x74\x62\x6f\x74'):
            if (!_0x385918) {
                const _0x215285 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x28d),
                    ...channelInfo
                };
                const _0x3e37f1 = {};
                _0x3e37f1[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x215285, _0x3e37f1);
                return;
            }
            const _0x348010 = await isAdmin(_0x57f7c2, _0x274a22, _0x5ea224);
            if (!_0x348010[_0x16ee98(0x25d)] && !_0x542caa['\x6b\x65\x79']['\x66\x72\x6f\x6d\x4d\x65']) {
                const _0x194a82 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x1e8),
                    ...channelInfo
                };
                const _0x39a89c = {};
                _0x39a89c['\x71\x75\x6f\x74\x65\x64'] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x194a82, _0x39a89c);
                return;
            }
            const _0x6ea966 = _0x5d0a50['\x73\x6c\x69\x63\x65']((_0x16eb4f + _0x16ee98(0x1eb))[_0x16ee98(0x24f)])[_0x16ee98(0x24e)]();
            await handleChatbotCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x6ea966);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x302)):
            const _0x539ef9 = _0xa588d1['\x73\x6c\x69\x63\x65']((_0x16eb4f + _0x16ee98(0x302))[_0x16ee98(0x24f)])[_0x16ee98(0x24e)]()['\x73\x70\x6c\x69\x74']('\x20');
            await takeCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x539ef9);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x322):
            await flirtCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2fe)):
            await characterCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x31b)):
            await wastedCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x27c):
            if (!_0x385918) {
                const _0x4503a4 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x327),
                    ...channelInfo
                };
                const _0x3a912b = {};
                _0x3a912b[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x4503a4, _0x3a912b);
                return;
            }
            await shipCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x2c2) || _0x5d0a50 === _0x16eb4f + _0x16ee98(0x2c8) || _0x5d0a50 === _0x16eb4f + '\x69\x6e\x66\x6f\x67\x72\x75\x70\x6f':
            if (!_0x385918) {
                const _0x2c8a96 = {
                    '\x74\x65\x78\x74': '\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x63\x61\x6e\x20\x6f\x6e\x6c\x79\x20\x62\x65\x20\x75\x73\x65\x64\x20\x69\x6e\x20\x67\x72\x6f\x75\x70\x73\x21',
                    ...channelInfo
                };
                const _0x2d25c0 = {};
                _0x2d25c0[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2['\x73\x65\x6e\x64\x4d\x65\x73\x73\x61\x67\x65'](_0x274a22, _0x2c8a96, _0x2d25c0);
                return;
            }
            await groupInfoCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + '\x72\x65\x73\x65\x74' || _0x5d0a50 === _0x16eb4f + '\x72\x65\x76\x6f\x6b\x65':
            if (!_0x385918) {
                const _0x356347 = {
                    '\x74\x65\x78\x74': _0x16ee98(0x327),
                    ...channelInfo
                };
                const _0x2c0a92 = {};
                _0x2c0a92[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2[_0x16ee98(0x1ed)](_0x274a22, _0x356347, _0x2c0a92);
                return;
            }
            await resetlinkCommand(_0x57f7c2, _0x274a22, _0x5ea224);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x25a) || _0x5d0a50 === _0x16eb4f + '\x6c\x69\x73\x74\x61\x64\x6d\x69\x6e':
            if (!_0x385918) {
                const _0x3bbcba = {
                    '\x74\x65\x78\x74': _0x16ee98(0x327),
                    ...channelInfo
                };
                const _0x5f2141 = {};
                _0x5f2141[_0x16ee98(0x2a9)] = _0x542caa;
                await _0x57f7c2['\x73\x65\x6e\x64\x4d\x65\x73\x73\x61\x67\x65'](_0x274a22, _0x3bbcba, _0x5f2141);
                return;
            }
            await staffCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x2eb)) || _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x262)):
            await urlCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2b8)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x1e3)):
            await emojimixCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x74\x67') || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x248)):
            await stickerTelegramCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + '\x76\x76':
            await viewOnceCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x256) || _0x5d0a50 === _0x16eb4f + _0x16ee98(0x235):
            await clearSessionCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x337)):
            const _0x2c7766 = _0x5d0a50[_0x16ee98(0x257)]('\x20')[_0x16ee98(0x2cc)](0x1);
            await autoStatusCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x2c7766);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x6d\x65\x74\x61\x6c\x6c\x69\x63'):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x33b));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x69\x63\x65'):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, '\x69\x63\x65');
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2b6)):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x2b6));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x69\x6d\x70\x72\x65\x73\x73\x69\x76\x65'):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x23c));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x22c)):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x22c));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x294)):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, '\x6c\x69\x67\x68\x74');
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x241)):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x241));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x325)):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x325));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x355)):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x355));
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x243)):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x243));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x202)):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x202));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x343)):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x343));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x61\x72\x65\x6e\x61'):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, '\x61\x72\x65\x6e\x61');
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x68\x61\x63\x6b\x65\x72'):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x2df));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x353)):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x353));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2c1)):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, '\x62\x6c\x61\x63\x6b\x70\x69\x6e\x6b');
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x67\x6c\x69\x74\x63\x68'):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x203));
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x66\x69\x72\x65'):
            await textmakerCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x16ee98(0x346));
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x288)):
            const _0x52f0e8 = _0x5d0a50[_0x16ee98(0x2cc)]((_0x16eb4f + _0x16ee98(0x288))[_0x16ee98(0x24f)])[_0x16ee98(0x24e)]();
            await handleAntideleteCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x52f0e8);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x372):
            await handleTicTacToeMove(_0x57f7c2, _0x274a22, _0x5ea224, _0x16ee98(0x372));
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x34f):
            await clearTmpCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x2b0):
            await setProfilePicture(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2ff)): {
                const _0xa21b80 = _0xa588d1[_0x16ee98(0x2cc)]((_0x16eb4f + '\x73\x65\x74\x67\x64\x65\x73\x63')[_0x16ee98(0x24f)])[_0x16ee98(0x24e)]();
                await setGroupDescription(_0x57f7c2, _0x274a22, _0x5ea224, _0xa21b80, _0x542caa);
            }
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x73\x65\x74\x67\x6e\x61\x6d\x65'): {
                const _0x49bd20 = _0xa588d1['\x73\x6c\x69\x63\x65']((_0x16eb4f + '\x73\x65\x74\x67\x6e\x61\x6d\x65')[_0x16ee98(0x24f)])[_0x16ee98(0x24e)]();
                await setGroupName(_0x57f7c2, _0x274a22, _0x5ea224, _0x49bd20, _0x542caa);
            }
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x73\x65\x74\x67\x70\x70'):
            await setGroupPhoto(_0x57f7c2, _0x274a22, _0x5ea224, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2ec)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x69\x6e\x73\x74\x61') || (_0x5d0a50 === _0x16eb4f + '\x69\x67' || _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x1fc))):
            await instagramCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2e6)):
            await igsCommand(_0x57f7c2, _0x274a22, _0x542caa, !![]);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x66\x62') || _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x2d8)):
            await facebookCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x22a)):
            await playCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x267)):
            await spotifyCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2b5)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x305)):
            await songCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x76\x69\x64\x65\x6f'):
            await videoCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x24d)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x74\x74'):
            await tiktokCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x295)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2dd)):
            await aiCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2f3)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x1e5)):
            const _0x4d5384 = _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2f3)) ? (_0x16eb4f + _0x16ee98(0x2f3))[_0x16ee98(0x24f)] : (_0x16eb4f + _0x16ee98(0x1e5))[_0x16ee98(0x24f)];
            await handleTranslateCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50[_0x16ee98(0x2cc)](_0x4d5384));
            return;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x73\x73') || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x331)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x306)):
            const _0x142b39 = _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x306)) ? (_0x16eb4f + '\x73\x63\x72\x65\x65\x6e\x73\x68\x6f\x74')[_0x16ee98(0x24f)] : _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x331)) ? (_0x16eb4f + _0x16ee98(0x331))[_0x16ee98(0x24f)] : (_0x16eb4f + '\x73\x73')[_0x16ee98(0x24f)];
            await handleSsCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50[_0x16ee98(0x2cc)](_0x142b39)['\x74\x72\x69\x6d']());
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x32a)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2b9)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x32f)):
            const _0x4e46b6 = _0x542caa[_0x16ee98(0x2e0)][_0x16ee98(0x264)] || _0x2f1ab4;
            await handleAreactCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x4e46b6);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x299)):
            await sudoCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x25e) || _0x5d0a50 === _0x16eb4f + '\x6c\x6f\x76\x65\x6e\x69\x67\x68\x74' || _0x5d0a50 === _0x16eb4f + '\x67\x6e':
            await goodnightCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x1e4) || _0x5d0a50 === _0x16eb4f + _0x16ee98(0x25c):
            await shayariCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x304):
            await rosedayCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x1e6)) || _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2cb)) || _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x35e)):
            await imagineCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50 === _0x16eb4f + '\x6a\x69\x64':
            await _0x3ccc90(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x222)):
            await autotypingCommand(_0x57f7c2, _0x274a22, _0x542caa);
            _0x2f2caf = !![];
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2fb)):
            await autoreadCommand(_0x57f7c2, _0x274a22, _0x542caa);
            _0x2f2caf = !![];
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x242)):
            await handleHeart(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x68\x6f\x72\x6e\x79'): {
                const _0x37c423 = _0x5d0a50[_0x16ee98(0x24e)]()[_0x16ee98(0x257)](/\s+/);
                const _0x4288fe = [
                    '\x68\x6f\x72\x6e\x79',
                    ..._0x37c423[_0x16ee98(0x2cc)](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x4288fe);
            }
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x22f)): {
                const _0x4b2daf = _0x5d0a50[_0x16ee98(0x24e)]()[_0x16ee98(0x257)](/\s+/);
                const _0x256918 = [
                    _0x16ee98(0x22f),
                    ..._0x4b2daf[_0x16ee98(0x2cc)](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x256918);
            }
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x233)): {
                const _0x817e1a = _0x5d0a50[_0x16ee98(0x24e)]()['\x73\x70\x6c\x69\x74'](/\s+/);
                const _0x470a63 = [
                    _0x16ee98(0x233),
                    ..._0x817e1a['\x73\x6c\x69\x63\x65'](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x470a63);
            }
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x26c)): {
                const _0xdd5830 = _0x5d0a50['\x74\x72\x69\x6d']()[_0x16ee98(0x257)](/\s+/);
                const _0x5e7830 = [
                    '\x6c\x6f\x6c\x69\x63\x65',
                    ..._0xdd5830['\x73\x6c\x69\x63\x65'](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5e7830);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x73\x69\x6d\x70\x63\x61\x72\x64'): {
                const _0x5cc52b = _0x5d0a50[_0x16ee98(0x24e)]()[_0x16ee98(0x257)](/\s+/);
                const _0x148cfa = [
                    _0x16ee98(0x282),
                    ..._0x5cc52b[_0x16ee98(0x2cc)](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x148cfa);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2a6)): {
                const _0x5aafbc = _0x5d0a50[_0x16ee98(0x24e)]()['\x73\x70\x6c\x69\x74'](/\s+/);
                const _0x5deb07 = [
                    _0x16ee98(0x2a6),
                    ..._0x5aafbc['\x73\x6c\x69\x63\x65'](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5deb07);
            }
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x32d)): {
                const _0x3ba611 = _0x5d0a50[_0x16ee98(0x24e)]()[_0x16ee98(0x257)](/\s+/);
                const _0x403ffa = [
                    _0x16ee98(0x32d),
                    ..._0x3ba611[_0x16ee98(0x2cc)](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x403ffa);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x6e\x61\x6d\x65\x63\x61\x72\x64'): {
                const _0x22a440 = _0x5d0a50[_0x16ee98(0x24e)]()[_0x16ee98(0x257)](/\s+/);
                const _0x347471 = [
                    _0x16ee98(0x250),
                    ..._0x22a440[_0x16ee98(0x2cc)](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x347471);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x33f)):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2cd)): {
                const _0x33ec59 = _0x5d0a50[_0x16ee98(0x24e)]()['\x73\x70\x6c\x69\x74'](/\s+/);
                const _0x3c27fd = _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x33f)) ? _0x16ee98(0x33f) : '\x6f\x6f\x67\x77\x61\x79';
                const _0x2a33d5 = [
                    _0x3c27fd,
                    ..._0x33ec59['\x73\x6c\x69\x63\x65'](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x2a33d5);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x74\x77\x65\x65\x74'): {
                const _0x395917 = _0x5d0a50[_0x16ee98(0x24e)]()[_0x16ee98(0x257)](/\s+/);
                const _0x3e5859 = [
                    '\x74\x77\x65\x65\x74',
                    ..._0x395917[_0x16ee98(0x2cc)](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x3e5859);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x251)): {
                const _0x22d882 = _0x5d0a50[_0x16ee98(0x24e)]()[_0x16ee98(0x257)](/\s+/);
                const _0x4464fd = [
                    '\x79\x6f\x75\x74\x75\x62\x65\x2d\x63\x6f\x6d\x6d\x65\x6e\x74',
                    ..._0x22d882['\x73\x6c\x69\x63\x65'](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x4464fd);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x209)):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2af)):
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x21c)):
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x206)):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x33d)):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2bb)): {
                const _0x634e4f = _0x5d0a50[_0x16ee98(0x24e)]()[_0x16ee98(0x257)](/\s+/);
                const _0x48e390 = _0x5d0a50[_0x16ee98(0x2cc)](_0x16eb4f[_0x16ee98(0x24f)])[_0x16ee98(0x257)](/\s+/)[0x0];
                const _0x4cba9b = [
                    _0x48e390,
                    ..._0x634e4f['\x73\x6c\x69\x63\x65'](0x1)
                ];
                await miscCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x4cba9b);
            }
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + _0x16ee98(0x2ce)): {
                const _0xbcaea9 = _0x5d0a50[_0x16ee98(0x24e)]()['\x73\x70\x6c\x69\x74'](/\s+/);
                const _0x11503d = _0xbcaea9[_0x16ee98(0x2cc)](0x1);
                await animeCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x11503d);
            }
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x1fb)):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2f2)):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x326)):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x29e)):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + '\x70\x61\x74'):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2e4)):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x36b)):
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x66\x61\x63\x65\x70\x61\x6c\x6d'):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x2f0)):
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16eb4f + '\x6c\x6f\x6c\x69'): {
                const _0x185bd5 = _0x5d0a50['\x74\x72\x69\x6d']()[_0x16ee98(0x257)](/\s+/);
                let _0x46af39 = _0x185bd5[0x0][_0x16ee98(0x2cc)](_0x16eb4f[_0x16ee98(0x24f)]);
                if (_0x46af39 === _0x16ee98(0x2d7))
                    _0x46af39 = _0x16ee98(0x2f0);
                await animeCommand(_0x57f7c2, _0x274a22, _0x542caa, [_0x46af39]);
            }
            break;
        case _0x5d0a50 === _0x16eb4f + _0x16ee98(0x23e):
            await stickercropCommand(_0x57f7c2, _0x274a22, _0x542caa);
            _0x2f2caf = !![];
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16eb4f + _0x16ee98(0x26a)): {
                const _0x45fde3 = _0xa588d1[_0x16ee98(0x24e)]()[_0x16ee98(0x257)](/\s+/);
                const _0x56fce2 = _0x45fde3[_0x16ee98(0x2cc)](0x1);
                await piesCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x56fce2);
                _0x2f2caf = !![];
            }
            break;
        case _0x5d0a50 === _0x16ee98(0x254):
            await piesAlias(_0x57f7c2, _0x274a22, _0x542caa, '\x63\x68\x69\x6e\x61');
            _0x2f2caf = !![];
            break;
        case _0x5d0a50 === _0x16ee98(0x1f6):
            await piesAlias(_0x57f7c2, _0x274a22, _0x542caa, '\x69\x6e\x64\x6f\x6e\x65\x73\x69\x61');
            _0x2f2caf = !![];
            break;
        case _0x5d0a50 === _0x16ee98(0x1ec):
            await piesAlias(_0x57f7c2, _0x274a22, _0x542caa, _0x16ee98(0x329));
            _0x2f2caf = !![];
            break;
        case _0x5d0a50 === _0x16ee98(0x210):
            await piesAlias(_0x57f7c2, _0x274a22, _0x542caa, '\x6b\x6f\x72\x65\x61');
            _0x2f2caf = !![];
            break;
        case _0x5d0a50 === _0x16ee98(0x368):
            await piesAlias(_0x57f7c2, _0x274a22, _0x542caa, _0x16ee98(0x371));
            _0x2f2caf = !![];
            break;
        case _0x5d0a50[_0x16ee98(0x342)](_0x16ee98(0x23b)):
        case _0x5d0a50[_0x16ee98(0x342)](_0x16ee98(0x2a4)):
        case _0x5d0a50[_0x16ee98(0x342)]('\x2e\x72\x65\x73\x74\x61\x72\x74'): {
                const _0x4f788c = _0xa588d1[_0x16ee98(0x24e)]()['\x73\x70\x6c\x69\x74'](/\s+/);
                const _0x3ea614 = _0x4f788c[0x1] && _0x4f788c[0x1][_0x16ee98(0x342)](_0x16ee98(0x286)) ? _0x4f788c[0x1] : '';
                await updateCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x2f1ab4, _0x3ea614);
            }
            _0x2f2caf = !![];
            break;
        case _0x5d0a50[_0x16ee98(0x342)]('\x2e\x72\x65\x6d\x6f\x76\x65\x62\x67') || _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16ee98(0x339)) || _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16ee98(0x26d)):
            await removebgCommand['\x65\x78\x65\x63'](_0x57f7c2, _0x542caa, _0x5d0a50[_0x16ee98(0x257)]('\x20')[_0x16ee98(0x2cc)](0x1));
            break;
        case _0x5d0a50[_0x16ee98(0x342)]('\x2e\x72\x65\x6d\x69\x6e\x69') || _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16ee98(0x285)) || _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16ee98(0x2d6)):
            await reminiCommand(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50[_0x16ee98(0x257)]('\x20')[_0x16ee98(0x2cc)](0x1));
            break;
        case _0x5d0a50['\x73\x74\x61\x72\x74\x73\x57\x69\x74\x68'](_0x16ee98(0x22e)):
            await soraCommand(_0x57f7c2, _0x274a22, _0x542caa);
            break;
        default:
            if (_0x385918) {
                if (_0x5d0a50) {
                    await handleChatbotResponse(_0x57f7c2, _0x274a22, _0x542caa, _0x5d0a50, _0x5ea224);
                }
                await handleTagDetection(_0x57f7c2, _0x274a22, _0x542caa, _0x5ea224);
                await handleMentionDetection(_0x57f7c2, _0x274a22, _0x542caa);
            }
            _0x2f2caf = ![];
            break;
        }
        if (_0x2f2caf !== ![]) {
            await showTypingAfterCommand(_0x57f7c2, _0x274a22);
        }
        async function _0x3ccc90(_0x58db03, _0xb8d48a, _0x4a91db) {
            const _0x5002c4 = _0x16ee98;
            const _0x22e29f = _0x4a91db[_0x5002c4(0x2e0)]['\x72\x65\x6d\x6f\x74\x65\x4a\x69\x64'];
            if (!_0x22e29f['\x65\x6e\x64\x73\x57\x69\x74\x68']('\x40\x67\x2e\x75\x73')) {
                const _0x4d7a63 = {};
                _0x4d7a63[_0x5002c4(0x205)] = _0x5002c4(0x31c);
                return await _0x58db03[_0x5002c4(0x1ed)](_0xb8d48a, _0x4d7a63);
            }
            const _0x5e32c0 = {};
            _0x5e32c0[_0x5002c4(0x205)] = '\u2705\x20\x47\x72\x6f\x75\x70\x20\x4a\x49\x44\x3a\x20' + _0x22e29f;
            const _0x2bfc5f = {};
            _0x2bfc5f[_0x5002c4(0x2a9)] = _0x4a91db;
            await _0x58db03['\x73\x65\x6e\x64\x4d\x65\x73\x73\x61\x67\x65'](_0xb8d48a, _0x5e32c0, _0x2bfc5f);
        }
        if (_0x5d0a50[_0x16ee98(0x342)]('\x2e')) {
            await addCommandReaction(_0x57f7c2, _0x542caa);
        }
    } catch (_0x2c200e) {
        console[_0x16ee98(0x212)](_0x16ee98(0x300), _0x2c200e[_0x16ee98(0x1f1)]);
        if (chatId) {
            const _0x5028c5 = {
                '\x74\x65\x78\x74': _0x16ee98(0x33e),
                ...channelInfo
            };
            await _0x57f7c2[_0x16ee98(0x1ed)](chatId, _0x5028c5);
        }
    }
}
async function handleGroupParticipantUpdate(_0x30487e, _0x115209) {
    const _0x4ddf29 = _0x18db78;
    try {
        const {
            id: _0xd33993,
            participants: _0x430ebd,
            action: _0x1932b6,
            author: _0x118bc4
        } = _0x115209;
        if (!_0xd33993[_0x4ddf29(0x217)]('\x40\x67\x2e\x75\x73'))
            return;
        let _0x55e95a = !![];
        try {
            const _0xa0f663 = JSON[_0x4ddf29(0x25f)](fs[_0x4ddf29(0x219)](_0x4ddf29(0x36a)));
            if (typeof _0xa0f663[_0x4ddf29(0x333)] === _0x4ddf29(0x266))
                _0x55e95a = _0xa0f663[_0x4ddf29(0x333)];
        } catch (_0x28afdc) {
        }
        if (_0x1932b6 === _0x4ddf29(0x240)) {
            if (!_0x55e95a)
                return;
            await handlePromotionEvent(_0x30487e, _0xd33993, _0x430ebd, _0x118bc4);
            return;
        }
        if (_0x1932b6 === '\x64\x65\x6d\x6f\x74\x65') {
            if (!_0x55e95a)
                return;
            await handleDemotionEvent(_0x30487e, _0xd33993, _0x430ebd, _0x118bc4);
            return;
        }
        if (_0x1932b6 === _0x4ddf29(0x2ba)) {
            await handleJoinEvent(_0x30487e, _0xd33993, _0x430ebd);
        }
        if (_0x1932b6 === _0x4ddf29(0x2b7)) {
            await handleLeaveEvent(_0x30487e, _0xd33993, _0x430ebd);
        }
    } catch (_0x7bf0cd) {
        console[_0x4ddf29(0x212)](_0x4ddf29(0x2da), _0x7bf0cd);
    }
}
module[_0x18db78(0x255)] = {
    '\x68\x61\x6e\x64\x6c\x65\x4d\x65\x73\x73\x61\x67\x65\x73': handleMessages,
    '\x68\x61\x6e\x64\x6c\x65\x47\x72\x6f\x75\x70\x50\x61\x72\x74\x69\x63\x69\x70\x61\x6e\x74\x55\x70\x64\x61\x74\x65': handleGroupParticipantUpdate,
    '\x68\x61\x6e\x64\x6c\x65\x53\x74\x61\x74\x75\x73': async (_0x4bf111, _0x5e01fb) => {
        await handleStatusUpdate(_0x4bf111, _0x5e01fb);
    }
};