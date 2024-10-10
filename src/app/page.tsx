"use client";

import { useState, useEffect } from "react";
import styles from "./hi.module.scss";
import axios from "axios";
import { evaluate } from "mathjs";

export default function Home() {
  const [num, setNum] = useState<number | undefined>(0);
  const [name, setName] = useState("nothing");
  const [move, setMove] = useState(0);
  const [types, setTypes] = useState<string[]>(["none"]);
  const [abilities, setAbilities] = useState<string[]>(["none"]);
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [flavorText, setFlavorText] = useState("");
  const [inputValue, setInputValue] = useState("0");
  const [errorMessage, setErrorMessage] = useState("");
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [spriteUrl, setSpriteUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isFirstRender) {
      const getData = async () => {
        if (num === 0) {
          setInputValue("0");
          setErrorMessage("");
          return;
        }

        setLoading(true);
        try {
          const res = await axios.get(
            `https://pokeapi.co/api/v2/pokemon/${num}`
          );
          interface ability {
            ability: {
              name: string;
            };
          }
          interface type {
            type: {
              name: string;
            };
          }
          interface FlavorTextEntry {
            flavor_text: string;
            language: {
              name: string;
            };
          }

          setName(res.data.name);
          setMove(res.data.moves.length);
          setAbilities(
            res.data.abilities.map((ability: ability) => ability.ability.name)
          );
          setTypes(res.data.types.map((type: type) => type.type.name));
          setHeight(res.data.height);
          setWeight(res.data.weight);
          setSpriteUrl(res.data.sprites.front_default);
          setErrorMessage("");

          const speciesRes = await axios.get(res.data.species.url);
          const flavorEntry = speciesRes.data.flavor_text_entries.find(
            (entry: FlavorTextEntry) => entry.language.name === "en"
          );

          setFlavorText(flavorEntry.flavor_text);
        } catch {
          setErrorMessage("This number is not valid. Try another Pokémon!");
          setNum(num);
          setName("nothing");
          setMove(0);
          setTypes(["none"]);
          setAbilities(["none"]);
          setHeight(0);
          setWeight(0);
          setInputValue("hello world!!");
          setFlavorText("");
          setSpriteUrl("");
        } finally {
          setLoading(false);
        }
      };

      getData();
    } else {
      setIsFirstRender(false);
    }
  }, [num, isFirstRender]);

  const handleButtonClick = (value: string) => {
    if (inputValue === "0" && !isNaN(Number(value))) {
      setInputValue(value);
    } else {
      setInputValue(inputValue + value);
    }
  };

  const handleCalculate = () => {
    try {
      const result = evaluate(inputValue);
      setNum(Math.floor(result));
      setInputValue(result.toString());
    } catch {
      setErrorMessage("Invalid expression");
    }
  };

  const resetStates = () => {
    setErrorMessage("");
    setNum(0);
    setName("nothing");
    setMove(0);
    setTypes(["none"]);
    setAbilities(["none"]);
    setHeight(0);
    setWeight(0);
    setInputValue("0");
    setFlavorText("");
    setSpriteUrl("");
  };

  return (
    <div className={styles.body}>
      <h2 className={styles.heading}>Pokemon Finding Calculator</h2>
      <h3>Warning: Do not use this calculator for your exams!</h3>
      <h2 className={styles.error}>{errorMessage}</h2>

      <div className={styles.calc}>
        <div className={styles.state}>
          <div className={styles.s1}>
            {loading ? (
              <strong>loading...</strong>
            ) : (
              <h1>
                {num} is {name}
              </h1>
            )}
            <hr />
            <h1>Type: {types.join(", ")}</h1>
            <hr />
            <h1>Moves: {move}</h1>
            <hr />

            <h1>Height: {height * 10} cm tall</h1>
            <hr />
            <h1>Weight: {weight / 10} kg</h1>
            <hr />
            <h1>Ability: {abilities.join(", ")}</h1>
            <hr />
          </div>
          <div className={styles.s2}>
            {" "}
            {spriteUrl && (
              <img
                src={spriteUrl}
                loading="lazy"
                alt={name}
                className={styles.sprite}
              />
            )}
          </div>
        </div>

        <input
          type="text"
          value={inputValue}
          readOnly
          className={styles.display}
        />
        <div className={styles.buttonContainer}>
          <input
            type="button"
            value="C"
            onClick={resetStates}
            className={styles.button}
          />
          {Array.from({ length: 10 }, (_, i) => (
            <input
              key={i}
              type="button"
              value={i}
              onClick={() => handleButtonClick(i.toString())}
              className={styles.button}
            />
          ))}
          {["+", "-", "*", "/"].map((operator) => (
            <input
              key={operator}
              type="button"
              value={operator}
              onClick={() => handleButtonClick(operator)}
              className={styles.button}
            />
          ))}
          <input
            type="button"
            value="="
            onClick={handleCalculate}
            className={styles.button}
          />
        </div>
      </div>
      <h1 className={styles.flavorText}>{flavorText}</h1>

      <div className={styles.footer}>
        <p>
          Created by{" "}
          <a target="_blank" href="https://santosh-gamma.vercel.app/">
            SANTOSH{" "}
          </a>
          &copy; {new Date().getFullYear()}
        </p>
        <p>
          Powered by{" "}
          <a target="_blank" href="https://pokeapi.co/">
            pokeAPI
          </a>
        </p>
      </div>
    </div>
  );
}
