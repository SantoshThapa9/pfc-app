"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./pfc.module.scss";
import axios from "axios";
import { evaluate } from "mathjs";
import Image from "next/image";

// Add LoadingSpinner component
const LoadingSpinner = () => (
  <div className={styles.loadingSpinner}>
    <div className={styles.pokeball}></div>
  </div>
);

// Define proper TypeScript interfaces
interface Ability {
  ability: {
    name: string;
  };
}

interface Type {
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

interface PokemonData {
  name: string;
  moves: string;
  abilities: Ability[];
  types: Type[];
  height: number;
  weight: number;
  species: {
    url: string;
  };
  sprites: {
    front_default: string;
  };
}

interface ErrorState {
  message: string;
  suggestion?: string;
}

export default function Home() {
  const [inputValue, setInputValue] = useState("0");
  const [errorState, setErrorState] = useState<ErrorState>({ message: "" });
  const [loading, setLoading] = useState(false);
  // Consolidated Pokemon state
  const [pokemon, setPokemon] = useState<{
    id: number | null;
    name: string;
    moveCount: number;
    types: string[];
    abilities: string[];
    height: number;
    weight: number;
    flavorText: string;
    spriteUrl: string;
  }>({
    id: null,
    name: "nothing",
    moveCount: 0,
    types: ["none"],
    abilities: ["none"],
    height: 0,
    weight: 0,
    flavorText: "",
    spriteUrl: "",
  });

  // Define the type for cached Pokemon data
  type CachedPokemonData = {
    id: number;
    name: string;
    moveCount: number;
    types: string[];
    abilities: string[];
    height: number;
    weight: number;
    flavorText: string;
    spriteUrl: string;
  };

  const [pokemonCache, setPokemonCache] = useState<
    Record<number, CachedPokemonData>
  >({});

  // Enhance error handling
  const handleError = (message: string, suggestion?: string) => {
    setErrorState({ message, suggestion });
    setPokemon((prev) => ({ ...prev, id: null }));
    setInputValue("hello world");
  };

  // Memoized fetch function
  const fetchPokemonData = useCallback(
    async (id: number) => {
      // Check cache first
      if (pokemonCache[id]) {
        setPokemon(pokemonCache[id]);
        return;
      }

      setLoading(true);
      setErrorState({ message: "" });

      try {
        const { data } = await axios.get<PokemonData>(
          `https://pokeapi.co/api/v2/pokemon/${id}`
        );

        const speciesRes = await axios.get(data.species.url);
        const flavorEntry = speciesRes.data.flavor_text_entries.find(
          (entry: FlavorTextEntry) => entry.language.name === "en"
        );

        const pokemonData = {
          id,
          name: data.name,
          moveCount: data.moves.length,
          types: data.types.map((t) => t.type.name),
          abilities: data.abilities.map((a) => a.ability.name),
          height: data.height,
          weight: data.weight,
          flavorText: flavorEntry.flavor_text.replace(/[\n\f]/g, " "),
          spriteUrl: data.sprites.front_default,
        };

        // Update cache
        setPokemonCache((prev) => ({
          ...prev,
          [id]: pokemonData,
        }));

        setPokemon(pokemonData);
        setInputValue(id.toString());
      } catch (error) {
        if (axios.isAxiosError(error)) {
          handleError(
            "Failed to fetch Pokémon data",
            "Please check your internet connection and try again"
          );
        } else if (error instanceof Error) {
          handleError(error.message, "Please try again later");
        } else {
          handleError("An unexpected error occurred", "Please try again later");
        }
      } finally {
        setLoading(false);
      }
    },
    [pokemonCache]
  );

  // Update fetchPokemon to use the memoized fetch function
  const fetchPokemon = useCallback(
    async (id: number) => {
      if (id <= 0 || id > 1017) {
        handleError(
          "Invalid Pokemon ID",
          "Please enter a number between 1 and 1017"
        );
        return;
      }

      await fetchPokemonData(id);
    },
    [fetchPokemonData]
  );

  // Random Pokemon handler
  const handleRandomPokemon = useCallback(() => {
    const randomId = Math.floor(Math.random() * 1017) + 1;
    fetchPokemon(randomId);
  }, [fetchPokemon]);

  // Handle calculations
  const handleCalculate = useCallback(() => {
    try {
      const result = evaluate(inputValue);
      const pokemonId = Math.floor(Number(result));

      if (isNaN(pokemonId)) {
        setErrorState({ message: "Invalid calculation result" });
        return;
      }

      fetchPokemon(pokemonId);
    } catch {
      setErrorState({ message: "Invalid mathematical expression" });
    }
  }, [inputValue, fetchPokemon]);

  // Reset all states
  const resetCalculator = useCallback(() => {
    setInputValue("0");
    setErrorState({ message: "" });
    setPokemon({
      id: null,
      name: "nothing",
      moveCount: 0,
      types: ["none"],
      abilities: ["none"],
      height: 0,
      weight: 0,
      flavorText: "",
      spriteUrl: "",
    });
  }, []);

  // Handle button clicks
  const handleButtonClick = useCallback(
    (value: string) => {
      setErrorState({ message: "" });

      if (value === "." && inputValue.includes(".")) return;

      setInputValue((prev) =>
        prev === "0" && value !== "." ? value : prev + value
      );
    },
    [inputValue]
  );

  // Handle special keys
  const handleSpecialKey = useCallback(
    (key: string) => {
      switch (key) {
        case "C":
          resetCalculator();
          break;
        case "=":
          handleCalculate();
          break;
        case "←":
          setInputValue((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
          break;
        default:
          handleButtonClick(key);
      }
    },
    [resetCalculator, handleCalculate, handleButtonClick]
  );

  // Add keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleButtonClick(e.key);
      if (["+", "-", "*", "/", ".", "^"].includes(e.key))
        handleButtonClick(e.key);
      if (e.key === "Enter") handleCalculate();
      if (e.key === "Escape") resetCalculator();
      if (e.key === "Backspace") handleSpecialKey("←");
      // Add support for Shift+6 for caret (^)
      if (e.key === "6" && e.shiftKey) handleButtonClick("^");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleButtonClick, handleCalculate, resetCalculator, handleSpecialKey]);

  return (
    <div className={styles.body}>
      <h2 className={styles.heading}>Pokemon Finding Calculator</h2>

      <div className={styles.controls}>
        <button
          onClick={handleRandomPokemon}
          className={styles.randomButton}
          aria-label="Get Random Pokemon"
        >
          Random Pokémon
        </button>
      </div>

      {errorState.message && (
        <div className={styles.errorContainer}>
          <h2 className={styles.error}>{errorState.message}</h2>
          {errorState.suggestion && (
            <p className={styles.errorSuggestion}>{errorState.suggestion}</p>
          )}
        </div>
      )}

      {pokemon.flavorText && (
        <div className={styles.flavorText}>
          <p>{pokemon.flavorText}</p>
        </div>
      )}

      <div className={styles.calc}>
        <div className={styles.state}>
          <div className={styles.s1}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <LoadingSpinner />
                <strong>Loading Pokémon data...</strong>
              </div>
            ) : (
              <>
                {pokemon.id && (
                  <h1>
                    #{pokemon.id} - {pokemon.name}
                  </h1>
                )}
                <hr />
                <h1>Type: {pokemon.types.join(", ")}</h1>
                <hr />
                <h1>Moves: {pokemon.moveCount}</h1>
                <hr />
                <h1>Height: {(pokemon.height * 10).toFixed(1)} cm</h1>
                <hr />
                <h1>Weight: {(pokemon.weight / 10).toFixed(1)} kg</h1>
                <hr />
                <h1>Abilities: {pokemon.abilities.join(", ")}</h1>
                <hr />
              </>
            )}
          </div>

          <div className={styles.s2}>
            {pokemon.spriteUrl && !loading && (
              <Image
                src={pokemon.spriteUrl}
                alt={pokemon.name}
                width={96}
                height={96}
                className={styles.sprite}
                priority
              />
            )}
          </div>
        </div>

        <input
          type="text"
          value={inputValue}
          readOnly
          className={styles.display}
          aria-label="Calculator display"
        />

        <div className={styles.buttonContainer}>
          <button
            onClick={() => handleSpecialKey("C")}
            className={styles.button}
            aria-label="Clear"
          >
            C
          </button>

          <button
            onClick={() => handleSpecialKey("←")}
            className={styles.button}
            aria-label="Backspace"
          >
            ←
          </button>

          {Array.from({ length: 10 }, (_, i) => (
            <button
              key={i}
              onClick={() => handleButtonClick(i.toString())}
              className={styles.button}
              aria-label={`Number ${i}`}
            >
              {i}
            </button>
          ))}

          {["+", "-", "*", "/", ".", "^"].map((operator) => (
            <button
              key={operator}
              onClick={() => handleButtonClick(operator)}
              className={`${styles.button} ${
                operator === "^" ? styles.special : ""
              }`}
              aria-label={`Operator ${operator}`}
            >
              {operator}
            </button>
          ))}

          <button
            onClick={handleCalculate}
            className={`${styles.button} ${styles.equals}`}
            aria-label="Calculate"
          >
            =
          </button>
        </div>
      </div>

      <div className={styles.footer}>
        <p>
          Created by{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://santosh-gamma.vercel.app/"
          >
            SANTOSH
          </a>
          &copy; {new Date().getFullYear()}.
        </p>
        <p>
          Powered by{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://pokeapi.co/"
          >
            PokeAPI
          </a>
        </p>
      </div>
    </div>
  );
}
