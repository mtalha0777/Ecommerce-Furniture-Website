import React, { useState } from 'react';
import { ClickAwayListener } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import '../selectDrop/select.css'; // Ensure correct path

const Select = ({ data, onSelect, placeholder }) => {
    const [isOpenSelect, setIsOpenSelect] = useState(false);
    const [selectedItem, setSelectedItem] = useState(placeholder || ''); 
    const [selectedIndex, setSelectedIndex] = useState(0); 

    const openSelect = () => {
        setIsOpenSelect(!isOpenSelect);
    }

    const closeSelect = (index, name) => {
        setSelectedIndex(index);
        setIsOpenSelect(false);
        setSelectedItem(name);
        onSelect(name); // Call the onSelect function passed as a prop
    }

    return (
        <ClickAwayListener onClickAway={() => setIsOpenSelect(false)}>
            <div className='selecDropWrapper cursor position-relative'>
                <span className='openSelect' onClick={openSelect}>
                    <ArrowDropDown style={{ height: '28px', fontSize: 22, color: "black", verticalAlign: "middle", float: 'right' }} />
                    {selectedItem}
                </span>
                {isOpenSelect && (
                    <div className='selectDrop'>
                        <div className='searchField'>
                            <ul className='searchResults'>
                                {data.map((item, index) => (
                                    <li key={index} onClick={() => closeSelect(index, item)} className={`${selectedIndex === index ? 'active' : ''}`}>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </ClickAwayListener>
    );
}

export { Select };
