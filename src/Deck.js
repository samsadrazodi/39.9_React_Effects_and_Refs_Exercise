import React, { useEffect, useState, useRef } from "react";
import Card from "./Card";
import axios from "axios";


const BASE_URL= "http://deckofcardsapi.com/api/deck";


function Deck(){
    const [deck, setDeck] = useState(null);
    const [drawn, setDrawn] = useState([]); //to keep track of each card that is drawn
    const [autoDraw, setAutoDraw] = useState(false); // To toggle autodraw based on # of remaining cards
    const timerRef = useRef(null);

    /* At mount: load deck from API into state. */
    useEffect(() => {
        async function getDeck() {
            let d = await axios.get(`${BASE_URL}/new/shuffle/`);
            setDeck(d.data);
        }
        getDeck();
    }, [setDeck]);


    useEffect(()=>{
        async function getCard() {
        let {deck_id} = deck;

        try {
            let res = await axios.get(`${BASE_URL}/${deck_id}/draw/`);
    
            if (res.data.remaining === 0) {      //Condition for when deck is finished
              setAutoDraw(false);  // Once deck is finished, disable AutoDraw
              throw new Error("No Cards Remaining!");
            }
    
            const card = res.data.cards[0];    // If deck is not finished, this is the card
    
            setDrawn(d => [
              ...d,
              {
                id: card.code,
                name: card.suit + " " + card.value,
                img: card.image
              }
            ]);

          } catch (err) {
            alert(err);
          }
        }


        if (autoDraw && !timerRef.current) {
            timerRef.current = setInterval(async () => {
              await getCard();
            }, 1000);
        }
        return () => {
            clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [autoDraw, setAutoDraw, deck]);

    const toggleAutoDraw = () => {
        setAutoDraw(a => !a);
    };
    
    const cards = drawn.map(c => (
    <Card key={c.id} name={c.name} img={c.img} />
    ));


    return (
        <div>
          {deck ? (
            <button onClick={toggleAutoDraw}>
              {autoDraw ? "STOP" : "KEEP"} DRAWING
            </button>
          ) : null}
          <div>{cards}</div>
        </div>
    );



}


export default Deck;
