import React, {useEffect, useState} from 'react'

import './Keypad.css'

export default function Keypad({keys}) {
    const [letters, setLetters] = useState(null);

    useEffect(() => {
        setLetters(keys);

    }, [])


    return (
        <div className="keypad">
            {letters && letters.map((l) => {
                return <div key ={l.key}>{l.key}</div>
            })}
        </div>
    )
}