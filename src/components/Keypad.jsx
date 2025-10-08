import React, {useEffect, useState} from 'react'
import './Keypad.css'

export default function Keypad({keys}) {
    const [letters, setLetters] = useState(null);


    console.log(keys);
    useEffect(() => {
        setLetters(keys);

    }, [keys])


    return (
        <div className="keypad">
            {keys.map((row, rowIndex) => (
            <div key={rowIndex} className="key-row">

                {row.map((keyObject) => {

                    const keyValue = keyObject.key;
                    const keyClass = `key-button ${keyValue === 'ENTER' || keyValue === '⌫' ? 'large-key' : ''}`; //bigger key for enter and backspace

                    return (
                        <div key={keyValue} className={keyClass}>
                            {keyValue}
                        </div>
                    )
                })}
            </div>
            ))}
        </div>
    )
}