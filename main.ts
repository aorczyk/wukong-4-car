let latestCommands: { [key: string]: number } = {}

let servoLimit = 30;

basic.clearScreen()

bluetooth.startUartService()

bluetooth.onBluetoothConnected(function () {
})

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    let commadParts = command.split("=")

    latestCommands[commadParts[0]] = parseFloat(commadParts[1])
})

basic.forever(function () {
    while (Object.keys(latestCommands).length) {
        let commandName = Object.keys(latestCommands)[0]
        let commandValue = latestCommands[commandName]
        delete latestCommands[commandName];

        if (commandName == "-v") {
            bluetooth.uartWriteLine('vc;import_start;')
            bluetooth.uartWriteLine('vc;init;')
            bluetooth.uartWriteLine(`vc;sr;1;-${servoLimit};${servoLimit};1;1;0;0;;`)
            bluetooth.uartWriteLine(`vc;jrx;-${servoLimit};${servoLimit};1;1;0;`)
            bluetooth.uartWriteLine(`vc;sl;1;-100;100;1;1;0;1;;`)
            bluetooth.uartWriteLine(`vc;jry;-100;100;1;0;0;`)

            bluetooth.uartWriteLine('vc;ox;1;-30;30;-60;60;10;1;0;')
            bluetooth.uartWriteLine('vc;oy;0;-30;30;-100;100;10;0;0;')
            bluetooth.uartWriteLine('vc;il;1;')
            bluetooth.uartWriteLine('vc;ir;1;')
            bluetooth.uartWriteLine('vc;show;sl,sr,jr,br,bl;')
            bluetooth.uartWriteLine('vc;import_end;')
        } else if (commandName == "oy" || commandName == "sl" || commandName == "jry") {
            wuKong.setMotorSpeed(wuKong.MotorList.M1, commandValue)
            wuKong.setMotorSpeed(wuKong.MotorList.M2, -commandValue)
        } else if (commandName == "ox" || commandName == "sr" || commandName == "jrx") {
            let value = commandValue + 180;
            let value2 = 180 - commandValue;
            if (value >= 180 - servoLimit && value <= 180 + servoLimit) {
                control.inBackground(() => {
                    wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S0, value)
                })
                control.inBackground(() => {
                    wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S7, value2)
                })

                // wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S0, value)
                // wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S1, value2)

            }
        }
    }
})