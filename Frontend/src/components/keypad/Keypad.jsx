import './Keypad.css'

export default function Keypad({keys, onKeyClick}) {


    return (
        <div className="keypad">
            {keys && Array.isArray(keys) && keys.map((row, rowIndex) => (
                <div key={rowIndex} className="key-row">
                    {row && Array.isArray(row) && row.map((keyObject) => {
                        const keyValue = keyObject.key;
                        const keyClass = `key-button ${keyValue === 'ENTER'|| keyValue === '⌫' || keyValue === '␣' ? 'large-key' : ''}`;

                        return (
                            <div
                                key={keyValue}
                                className={keyClass}
                                onClick={() => onKeyClick(keyValue)}
                            >
                                {keyValue}
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}