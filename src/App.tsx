import { createSignal, createEffect, Show } from 'solid-js'
// import { Carousel } from 'solid-bootstrap'
import './App.css'

export type collectable = {
  name: string,
  rarity: string,
  img: string,
}


function App() {
  const [items, setItems] = createSignal<collectable[]>()
  const [collectables, setCollectables] = createSignal<collectable[]>([])
  const [lastCollected, setLastCollected] = createSignal<collectable[]>([])
  const [pity, setPity] = createSignal(0)
  const [tokens, setTokens] = createSignal(20)

  createEffect(async () => {
    getCollectables()
  })

  const testSystem = function () {
    if (items()![0].rarity != "legendary") {
      getRandomCollectable(1)
      setTimeout(() => {
        testSystem()
      }, 50)
    } else return

  }

  const getCollectables = async function () {
    Twitch.ext.onAuthorized((_values) => {
      //TODO Auth token
    })
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/collectables/`)
    const data = await res.json();
    setCollectables(data)
  }

  const makeRequest = async function(amount: number) {
    let fetchString: string = import.meta.env.VITE_SERVER_URL
    fetchString += "/api/collectables/random"
    if(amount > 1) fetchString += `?amount=${amount}` 
    else fetchString += "/"
    const res = await fetch(fetchString)

    const data: collectable[] = await res.json()

    data.forEach(item => {
      setPity(pity() + 1)
      if (item.rarity == "legendary") setPity(1)
    })


    let tempArr = lastCollected();
    data.forEach(item => {
      tempArr.push(item)
      if (tempArr.length > 10) {
        tempArr = tempArr.slice(1)
      }
    })
    setLastCollected([...tempArr])

    return data
  }

  const getRandomCollectable = async function (amount: number) {

    if((tokens() - amount) < 0) {
      console.log(await Twitch.ext.bits.getProducts())
      switch (amount) {
        case 1:
          Twitch.ext.bits.useBits("1")
          break;
        case 10:
          Twitch.ext.bits.useBits("2")
          break;
        case 20:
          Twitch.ext.bits.useBits("3")
          break;
        default:
          break;
      }
      Twitch.ext.bits.showBitsBalance()
      Twitch.ext.bits.onTransactionComplete(async (transaction) => {
        switch (transaction.product.sku) {
          case "1":
            setTokens(tokens() + 1);
            break;
          case "2":
            setTokens(tokens() + 10);
            break;
          case "3":
            setTokens(tokens() + 20);
            break;
          default:
            break;
        }
      })
      return
    }
      // collection.push(await makeRequest())
    setTokens(tokens() - amount)
    const data = await makeRequest(amount)
    setItems(data)
  }

  return (
    <>
    <header>
      <h1>Stream Collectables</h1>
      <p>Tokens Remaining: {tokens()}</p>
    </header>
      <div class='centered'>
        <button onclick={()=> setTokens(tokens() + 1)}>+1 Token</button>
        <button onclick={()=> setTokens(tokens() + 5)}>+5 Token</button>
        <button onclick={()=> setTokens(tokens() + 10)}>+10 Token</button>
        <button onclick={()=> setTokens(tokens() + 100)}>+100 Token</button>
      </div>
      <div class='wish'>
        <button onClick={() => getRandomCollectable(1)}>
          1 Pull
        </button>
        <button onClick={() => getRandomCollectable(10)}>
          10 Pull
        </button>
        <button onClick={() => getRandomCollectable(20)}>
          20 Pull
        </button>
      </div>
      <div>
        <div class="card">
          <Show when={items()}>
            <div class="puff-grid">
              {items()?.map((item: collectable) => {
                return(
                  <div class={`puff ${item.rarity.trimEnd().replace(" ", "-")}`}>
                    <img src={item.img} alt="" />
                    <p class={`puff-name ${item.rarity.trimEnd().replace(" ", "-")}`}> {item. name} </p>
                  </div>
                )})}
              {/* <Carousel activeIndex={index()} onSelect={handleSelect} interval={null} keyboard>
                {items()?.map((item: collectable) => {
                  return(
                  <Carousel.Item>
                    <div class='puff'>
                      <img src={item.img} alt="" />
                      <Carousel.Caption>
                        <p class={`puff-name ${item.rarity.trimEnd().replace(" ", "-")}`}> {item. name} </p>
                      </Carousel.Caption>
                    </div>
                  </Carousel.Item>
                )
                })}
              </Carousel> */}
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
      <Show when={import.meta.env.DEV && false}>
        <button onClick={() => testSystem()}>
          Break everything!
        </button>
      </Show>
    </>
  )
}

export default App
