import { createSignal, createEffect, Show } from 'solid-js'
import './App.css'

export type collectable = {
  name: string,
  rarity: string,
  img: string,
}


function App() {
  const [item, setItem] = createSignal<collectable>()
  const [collectables, setCollectables] = createSignal<collectable[]>([])
  const [lastCollected, setLastCollected] = createSignal<collectable[]>([])
  const [pity, setPity] = createSignal(0)

  createEffect(async () => {
    getCollectables()
  })

  const testSystem = function () {
    if (item()?.rarity != "legendary") {
      getRandomCollectable()
      setTimeout(() => {
        testSystem()
      }, 50)
    } else return

  }

  const getCollectables = async function () {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/collectables/`)
    const data = await res.json();
    setCollectables(data)
  }

  const getRandomCollectable = async function () {

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/collectables/random`,
      {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({"pity": pity()})
      })

    const data: collectable = await res.json()

    setPity(pity() + 1)
    if (item()?.rarity == "legendary") setPity(1)

    let tempArr = lastCollected();
    if (tempArr.length >= 10) {
      tempArr = tempArr.slice(1)
    }
    tempArr.push(data)
    setLastCollected([...tempArr])

    setItem(data);
  }

  return (
    <>
      <h1>Stream Collectables</h1>
      <div class='grid'>
        <div class="card">
          <button onClick={() => getRandomCollectable()}>
            Try your luck!
          </button>
          <Show when={item()}>
            <div class=''>
              <p class={`puff-name ${item()?.rarity.trimEnd().replace(" ", "-")}`}> {item()?.name} </p>
              <img src={item()?.img} alt="" />
            </div>
          </Show>
        </div>
        <aside>
          <h2>Current Collectables</h2>
          <Show when={collectables()} fallback={<div>Loading...</div>}>
            <ul style={{
              "list-style": "none",
              "text-align": 'left'
            }}>
              {collectables().map(c => {
                return (
                  <li>
                    {c.name} : <span class={c?.rarity.trimEnd().replace(" ", "-")}>{c.rarity}</span>
                  </li>
                )
              })}
            </ul>
          </Show>
          <h3>Previous Pulls</h3>
          <p class='pulls-since'>Pulls since last Legendary: <span>{pity()}</span></p>
          <ul class='previous-pulls'>
            {lastCollected().map(c => {
              return (<li class={c?.rarity.trimEnd().replace(" ", "-")}>{c.name}</li>)
            })}
          </ul>
        </aside>
      </div>
      <Show when={import.meta.env.DEV}>
        <button onClick={() => testSystem()}>
          Break everything!
        </button>
      </Show>
    </>
  )
}

export default App
