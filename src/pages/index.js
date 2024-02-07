import { useEffect, useState, Fragment, useRef } from "react";
import axios from "axios";
import moment from "moment";

import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import Menu from "./components/menu";

import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Filler,
  ArcElement,
} from "chart.js";
import { Chart, Doughnut } from "react-chartjs-2";

const money = [
  {
    id: 1,
    name: "Bitcoin",
    avatar: "https://www.datocms-assets.com/51952/1635193869-btc.png",
    value: "BTC_USDT",
    label: "BTC/USDT",
    grafico: "POLONIEX:BTCUSDT",
  },
  {
    id: 2,
    name: "Ethereum",
    avatar: "https://www.datocms-assets.com/51952/1635345356-eth.png",
    value: "ETH_USDT",
    label: "ETH/USDT",
    grafico: "POLONIEX:ETHUSDT",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  const container = useRef();
  const [selected, setSelected] = useState(money[0]);
  const [coin, setCoin] = useState();
  const [order, setOrder] = useState();
  const [totalSell, setTotalSell] = useState();
  const [totalBuy, setTotalBuy] = useState();

  const [isRequestPending, setIsRequestPending] = useState(false);
  const [isRequestPending2, setIsRequestPending2] = useState(false);
  const [valueCoin, setValueCoin] = useState([]);
  const [dataCoin, setDataCoin] = useState([]);

  const [buyCoin, setBuyCoin] = useState([]);
  const [sellCoin, setSellCoin] = useState([]);
  const [buyCoin2, setBuyCoin2] = useState([]);
  const [sellCoin2, setSellCoin2] = useState([]);
  const [valueCoin2, setValueCoin2] = useState([]);

  async function buscar() {
    try {
      setIsRequestPending(true);
      const url =
        "https://corsproxy.io/?" +
        encodeURIComponent(
          "https://api.poloniex.com/markets/" + selected.value + "/ticker24h"
        );
      const response = await axios.get(url);

      let newDate = Data(response.data.closeTime);
      setDataCoin((prevDataCoin) => [...prevDataCoin, newDate]);

      let newValue = parseFloat(response.data.close);
      setValueCoin((prevValueCoin) => [...prevValueCoin, newValue]);
      setValueCoin2(newValue);

      setCoin(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRequestPending(false);
    }
  }

  async function OrderBook() {
    try {
      setIsRequestPending2(true);
      const url =
        "https://corsproxy.io/?" +
        encodeURIComponent(
          "https://api.poloniex.com/markets/" +
            selected.value +
            "/trades?limit=15"
        );
      const response = await axios.get(url);
      let totalbuy = 0;
      let totalsell = 0;
      for (let index = 0; index < response.data.length; index++) {
        if (response.data[index]["takerSide"] == "BUY") {
          totalbuy += parseFloat(response.data[index]["amount"]);

          let newValueBuy = parseFloat(response.data[index]["price"]);
          setBuyCoin((prevBuyCoin) => [...prevBuyCoin, newValueBuy]);
          setBuyCoin2(newValueBuy);
        } else {
          totalsell += parseFloat(response.data[index]["amount"]);

          let newValueSell = parseFloat(response.data[index]["price"]);
          setSellCoin((prevSellCoin) => [...prevSellCoin, newValueSell]);
          setSellCoin2(newValueSell);
        }

        setTotalBuy(totalbuy);
        setTotalSell(totalsell);
      }
      setOrder(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRequestPending2(false);
    }
  }

  useEffect(() => {
    OrderBook();

    const intervalId = setInterval(() => {
      if (!isRequestPending2) {
        OrderBook();
      }
    }, 3000); // 3000 milissegundos, que equivalem a 3 segundos

    return () => clearInterval(intervalId);
  }, [selected]);

  useEffect(() => {
    buscar();

    const intervalId = setInterval(() => {
      if (!isRequestPending) {
        buscar();
      }
    }, 3000); // 3000 milissegundos, que equivalem a 3 segundos

    return () => clearInterval(intervalId);
  }, [selected]);

  useEffect(() => {
    setValueCoin([]);
    setDataCoin([]);
    setBuyCoin([]);
    setSellCoin([]);
  }, [selected]);

  function formatarMoeda(valor) {
    // Formatando como moeda brasileira (BRL) usando Intl.NumberFormat
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "USD",
    });
    const formattedPrice = formatter.format(valor);

    return formattedPrice;
  }

  function Volume(valor) {
    // Formata o valor usando o método `NumberFormat()`.
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

    const valorFormatado = formatter.format(valor);
    return valorFormatado;
  }

  function Data(valor) {
    const formattedDate = moment(valor).format("DD/MM/YYYY HH:mm:ss");

    return formattedDate;
  }

  ChartJS.register(
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    LineController,
    BarController,
    Filler,
    Tooltip,
    ArcElement
  );

  const options = {
    borderWidth: 1,
    responsive: true,
    maintainAspectRatio: false, // Allow independent scaling if needed

    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
  };

  const data = {
    labels: dataCoin,
    datasets: [
      {
        type: "line",
        label: "Preço da Moeda",
        data: valueCoin,
        borderColor: "blue", // Solid blue border
        backgroundColor: "rgba(0, 0, 255, 0.5)", // Semi-transparent blue fill
      },
      {
        type: "line",
        label: "Preço de Compra",
        data: buyCoin,
        borderColor: "rgb(0, 128, 0)", // Green border
        backgroundColor: "rgba(0, 128, 0, 0.5)", // Green background with 50% opacity
        fill: false,
      },
      {
        type: "line",
        label: "Preço de Venda",
        data: sellCoin,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        fill: false,
      },
    ],
  };

  const data2 = {
    labels: ["Preço de Venda", "Preço de Compra", "Preço da Moeda"],
    datasets: [
      {
        label: "Valor",
        data: [buyCoin2, sellCoin2, valueCoin2],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(0, 0, 255, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(0, 0, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  function graf() {
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${selected.grafico}",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "br",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "support_host": "https://www.tradingview.com"
        }`;
    container.current.appendChild(script);
  }

  useEffect(() => {
    graf();
  }, [selected]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/Loopple/loopple-public-assets@main/riva-dashboard-tailwind/riva-dashboard.css"
      />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.css"
        rel="stylesheet"
      />

      <Menu />

      <div
        style={{
          paddingTop: "1rem",
          paddingRight: "1rem",
          paddingLeft: "1rem",
        }}
      >
        <div className="mb-5 mt-2">
          <Listbox value={selected} onChange={setSelected}>
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                  <span className="mr-3 font-semibold text-black text-xl">
                    Selecione a moeda:
                  </span>
                </Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-gray-100	 py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                    <span className="flex items-center p-2">
                      <img
                        src={selected.avatar}
                        alt=""
                        className="h-10 w-10 flex-shrink-0 rounded-full"
                      />
                      <span className="ml-3 block truncate font-semibold">
                        {selected.name}
                      </span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-100	 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {money.map((person) => (
                        <Listbox.Option
                          key={person.id}
                          className={({ active }) =>
                            classNames(
                              active
                                ? "bg-indigo-600 text-white"
                                : "text-gray-900",
                              "relative cursor-default select-none py-2 pl-3 pr-9"
                            )
                          }
                          value={person}
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <img
                                  src={person.avatar}
                                  alt=""
                                  className="h-10 w-10 flex-shrink-0 rounded-full"
                                />
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "ml-3 block truncate"
                                  )}
                                >
                                  {person.name}
                                </span>
                              </div>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? "text-white" : "text-indigo-600",
                                    "absolute inset-y-0 right-0 flex items-center pr-4"
                                  )}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>
        </div>
        <span className="mr-3 font-semibold text-black text-xl">Gráficos</span>
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-6 mt-2">
          <div>
            {" "}
            <div className="flex flex-wrap -mx-3 mb-5">
              <div className="w-full max-w-full px-3 mb-6  mx-auto">
                <div className="relative flex-[1_auto] flex flex-col break-words min-w-0 bg-clip-border rounded-[.95rem] bg-gray-100 m-5">
                  <div className="relative flex flex-col min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30">
                    {/* <div className="px-9 pt-5 flex justify-between items-stretch flex-wrap min-h-[70px] pb-0 bg-transparent">
                      <h3 className="flex flex-col items-start justify-center m-0 mb-0 ml-0 font-medium text-xl/tight text-dark">
                        <span className="mr-3 font-semibold text-dark">
                          Gráfico
                        </span>
                      </h3>
                    </div> */}
                    <div className="flex-auto block py-2 pt-2 px-2">
                      <div
                        className="overflow-x-auto"
                        style={{ height: "30rem" }}
                      >
                        <Chart type="line" data={data} options={options} />
                        {/* <Doughnut data={data2} /> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            {" "}
            <div className="flex flex-wrap -mx-3 mb-5">
              <div className="w-full max-w-full px-3 mb-6  mx-auto">
                <div className="relative flex-[1_auto] flex flex-col break-words min-w-0 bg-clip-border rounded-[.95rem] bg-gray-100 m-5">
                  <div className="relative flex flex-col min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30">
                    {/* <div className="px-9 pt-5 flex justify-between items-stretch flex-wrap min-h-[70px] pb-0 bg-transparent">
                      <h3 className="flex flex-col items-start justify-center m-0 mb-0 ml-0 font-medium text-xl/tight text-dark">
                        <span className="mr-3 font-semibold text-dark">
                          Gráfico
                        </span>
                      </h3>
                    </div> */}
                    <div className="flex-auto block py-2 pt-2 px-2">
                      <div
                        className="overflow-x-auto"
                        style={{ height: "30rem" }}
                      >
                        <div
                          className="tradingview-widget-container"
                          ref={container}
                          style={{ height: "100%", width: "100%" }}
                        >
                          <div
                            className="tradingview-widget-container__widget"
                            style={{
                              height: "calc(100% - 32px)",
                              width: "100%",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-5">
          <div className="w-full max-w-full px-3 mb-6  mx-auto">
            <div className="relative flex-[1_auto] flex flex-col break-words min-w-0 bg-clip-border rounded-[.95rem] bg-gray-100	 m-5">
              <div className="relative flex flex-col min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30">
                <div className="px-9 pt-5 flex justify-between items-stretch flex-wrap min-h-[70px] pb-0 bg-transparent">
                  <h3 className="flex flex-col items-start justify-center m-2 ml-0 font-medium text-xl/tight text-dark">
                    <span className="mr-3 font-semibold text-dark">
                      Cotações
                    </span>
                  </h3>
                </div>

                <div className="flex-auto block py-8 pt-0 px-9">
                  <div className="overflow-x-auto">
                    <table className="w-full my-0 align-middle text-dark border-neutral-200">
                      <thead className="align-bottom">
                        <tr className="font-semibold text-[0.95rem] text-secondary-dark">
                          <th className="pb-3 text-start min-w-[175px]">
                            Moeda
                          </th>
                          <th className="pb-3 text-center min-w-[175px]">
                            Preço
                          </th>
                          <th className="pb-3 text-center min-w-[175px]">
                            Variação em 24h
                          </th>
                          <th className="pb-3  text-center min-w-[175px]">
                            Máximo em 24h / Mínimo em 24h
                          </th>
                          <th className="pb-3  text-center min-w-[175px]">
                            Volume em 24h (BTC)
                          </th>
                          {/* <th className="pb-3 text-center min-w-[175px]">
                            Ação
                          </th> */}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-dashed last:border-b-0">
                          <td className="p-3 pl-0">
                            <div className="flex items-center">
                              <div className="relative inline-block shrink-0 rounded-2xl me-3">
                                <img
                                  src={selected.avatar}
                                  className="w-[50px] h-[50px] inline-block shrink-0 rounded-2xl"
                                  alt=""
                                />
                              </div>
                              <div className="flex flex-col justify-start">
                                <a className="mb-1 font-semibold transition-colors duration-200 ease-in-out text-lg/normal text-secondary-inverse hover:text-primary">
                                  {selected.label}
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 pr-0 text-center">
                            <span className="font-semibold text-light-inverse text-md/normal">
                              {coin && <p>{formatarMoeda(coin.close)}</p>}
                            </span>
                          </td>
                          <td className="p-3 pr-0 text-center">
                            {coin && coin.dailyChange <= 0 ? (
                              <span className="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-lg/none text-danger bg-danger-light rounded-lg">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-5 h-5 mr-1"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"
                                  />
                                </svg>{" "}
                                {coin && (coin.dailyChange * 100).toFixed(2)}%{" "}
                              </span>
                            ) : (
                              <span className="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-lg/none text-success bg-success-light rounded-lg">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className="w-5 h-5 mr-1"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                                  />
                                </svg>{" "}
                                {coin && (coin.dailyChange * 100).toFixed(2)}%{" "}
                              </span>
                            )}
                          </td>
                          <td className="p-3 pr-12 text-center">
                            <span className="font-semibold text-light-inverse text-md/normal">
                              {coin && formatarMoeda(coin.high)} /{" "}
                              {coin && formatarMoeda(coin.low)}
                            </span>
                          </td>
                          <td className="pr-0 text-center">
                            <span className="font-semibold text-light-inverse text-md/normal">
                              {coin && Volume(coin.amount)}{" "}
                            </span>
                          </td>
                          {/* <td className="pr-0 text-center">
                            <span className="disabled:opacity-75 text-center align-baseline inline-flex px-4 py-3 mr-auto items-center font-semibold text-[.95rem] leading-none text-primary bg-primary-light rounded-lg">
                              {" "}
                              Negociar{" "}
                            </span>
                          </td> */}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-6"
          style={{ marginTop: "-1.5rem" }}
        >
          <div>
            <div className="flex flex-wrap -mx-3 mb-5">
              <div className="w-full max-w-full px-3 mb-6  mx-auto">
                <div className="relative flex-[1_auto] flex flex-col break-words min-w-0 bg-clip-border rounded-[.95rem] bg-gray-100	 m-5">
                  <div className="relative flex flex-col min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30">
                    <div className="px-9 pt-5 flex justify-between items-stretch flex-wrap min-h-[70px] pb-0 bg-transparent">
                      <h3 className="flex flex-col items-start justify-center m-2 ml-0 font-medium text-xl/tight text-dark">
                        <span className="mr-3 font-semibold text-dark">
                          Ordem de Compra
                        </span>
                        <span className="mt-1 font-medium text-secondary-dark text-lg/normal"></span>
                      </h3>
                    </div>

                    <div>
                      <div className="flex-auto block py-8 pt-6 px-9">
                        <div className="overflow-x-auto">
                          <table className="w-full my-0 align-middle text-dark border-neutral-200">
                            <thead className="align-bottom">
                              <tr className="font-semibold text-[0.95rem] text-secondary-dark">
                                <th className="pb-3 text-center min-w-[175px]">
                                  Preço(USDT)
                                </th>
                                <th className="pb-3 text-center min-w-[175px]">
                                  Valor(BTC)
                                </th>
                                <th className="pb-3  text-center min-w-[175px]">
                                  Data
                                </th>
                                <th className="pb-3  text-center min-w-[175px]">
                                  Total(USDT)
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {order &&
                                order
                                  .filter(
                                    (orderItem) => orderItem.takerSide === "BUY"
                                  )
                                  .map((orderItem) => (
                                    <tr
                                      key={orderItem.id}
                                      className="text-base border-b border-dashed last:border-b-0 pt-5 hover:bg-success-light  transition-all duration-300 ease-in-out"
                                    >
                                      <td className="pr-0 text-center flex">
                                        <span className="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-lg/none text-success bg-success-light rounded-lg">
                                          Compra
                                        </span>
                                        <span className="font-semibold text-light-inverse text-md/normal">
                                          {formatarMoeda(orderItem.price)}
                                        </span>
                                      </td>
                                      <td className="pr-0 text-center">
                                        <span className="font-semibold text-light-inverse text-md/normal">
                                          {orderItem.quantity}
                                        </span>
                                      </td>

                                      <td className="pr-0 text-center">
                                        <span className="font-semibold text-light-inverse text-md/normal">
                                          {Data(orderItem.createTime)}
                                        </span>
                                      </td>
                                      <td className="pr-0 text-center">
                                        <span className="font-semibold text-light-inverse text-md/normal">
                                          {formatarMoeda(orderItem.amount)}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}

                              <tr className="text-lg border-b border-dashed last:border-b-0 pt-5 hover:bg-success-light  transition-all duration-300 ease-in-out">
                                <td className="pr-0 text-center mt-5">
                                  <span className="font-semibold text-light-inverse text-md/normal">
                                    Total Geral
                                  </span>
                                </td>
                                <td className="pr-0 text-center">
                                  <span className="font-semibold text-light-inverse text-md/normal">
                                    -
                                  </span>
                                </td>
                                <td className="pr-0 text-center">
                                  <span className="font-semibold text-light-inverse text-md/normal">
                                    -
                                  </span>
                                </td>
                                <td className="pr-0 text-center">
                                  <span className="font-semibold text-light-inverse text-md/normal">
                                    {formatarMoeda(
                                      parseFloat(totalBuy && totalBuy)
                                    )}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="flex-auto block py-8 pt-6 px-9">
                      <div className="overflow-x-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div>
              <div className="flex flex-wrap -mx-3 mb-5">
                <div className="w-full max-w-full px-3 mb-6  mx-auto">
                  <div className="relative flex-[1_auto] flex flex-col break-words min-w-0 bg-clip-border rounded-[.95rem] bg-gray-100	 m-5">
                    <div className="relative flex flex-col min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30">
                      <div className="px-9 pt-5 flex justify-between items-stretch flex-wrap min-h-[70px] pb-0 bg-transparent">
                        <h3 className="flex flex-col items-start justify-center m-2 ml-0 font-medium text-xl/tight text-dark">
                          <span className="mr-3 font-semibold text-dark">
                            Ordem de Venda
                          </span>
                          <span className="mt-1 font-medium text-secondary-dark text-lg/normal"></span>
                        </h3>
                      </div>

                      <div>
                        <div className="flex-auto block py-8 pt-6 px-9">
                          <div className="overflow-x-auto">
                            <table className="w-full my-0 align-middle text-dark border-neutral-200">
                              <thead className="align-bottom">
                                <tr className="font-semibold text-[0.95rem] text-secondary-dark">
                                  <th className="pb-3 text-center min-w-[175px]">
                                    Preço(USDT)
                                  </th>
                                  <th className="pb-3 text-center min-w-[175px]">
                                    Valor(BTC)
                                  </th>
                                  <th className="pb-3  text-center min-w-[175px]">
                                    Data
                                  </th>
                                  <th className="pb-3  text-center min-w-[175px]">
                                    Total(USDT)
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {order &&
                                  order
                                    .filter(
                                      (orderItem) =>
                                        orderItem.takerSide === "SELL"
                                    )
                                    .map((orderItem) => (
                                      <tr
                                        key={orderItem.id}
                                        className="text-base border-b border-dashed last:border-b-0 pt-5 hover:bg-danger-light  transition-all duration-300 ease-in-out"
                                      >
                                        <td className="pr-0 text-center flex">
                                          <span className="text-center align-baseline inline-flex px-2 py-1 mr-auto items-center font-semibold text-lg/none text-danger bg-danger-light rounded-lg">
                                            Venda
                                          </span>

                                          <span className="font-semibold text-light-inverse text-md/normal">
                                            {formatarMoeda(orderItem.price)}
                                          </span>
                                        </td>
                                        <td className="pr-0 text-center">
                                          <span className="font-semibold text-light-inverse text-md/normal">
                                            {orderItem.quantity}
                                          </span>
                                        </td>

                                        <td className="pr-0 text-center">
                                          <span className="font-semibold text-light-inverse text-md/normal">
                                            {Data(orderItem.createTime)}
                                          </span>
                                        </td>
                                        <td className="pr-0 text-center">
                                          <span className="font-semibold text-light-inverse text-md/normal">
                                            {formatarMoeda(orderItem.amount)}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}

                                <tr className="text-lg border-b border-dashed last:border-b-0 pt-5 hover:bg-danger-light  transition-all duration-300 ease-in-out">
                                  <td className="pr-0 text-center mt-5">
                                    <span className="font-semibold text-light-inverse text-md/normal">
                                      Total Geral
                                    </span>
                                  </td>
                                  <td className="pr-0 text-center">
                                    <span className="font-semibold text-light-inverse text-md/normal">
                                      -
                                    </span>
                                  </td>
                                  <td className="pr-0 text-center">
                                    <span className="font-semibold text-light-inverse text-md/normal">
                                      -
                                    </span>
                                  </td>
                                  <td className="pr-0 text-center">
                                    <span className="font-semibold text-light-inverse text-md/normal">
                                      {formatarMoeda(
                                        parseFloat(totalSell && totalSell)
                                      )}
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.js"></script>
    </>
  );
}
