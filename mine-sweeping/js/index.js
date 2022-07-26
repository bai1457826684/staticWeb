const { ref, reactive, toRefs, onMounted, computed } = Vue;
const { Field, CellGroup } = vant;

const Main = {
  setup() {
    const state = reactive({
      // 表单的配置
      formOptions: {
        col: 10,
        row: 10,
        boom: 10,
        second: -1,
      },
      // 实际的配置
      options: {
        col: 0,
        row: 0,
        boom: 0,
        second: -1,
      },
      // num：附近炸弹数量  status：0未打开，1已打开，2问号，3插旗  isThunder：雷
      mineList: [],
      // 0 未开始  1 进行中  2 失败  3 胜利
      gameStatus: 0,
      time: 0,

      text: '',
      tel: '',
    });

    onMounted(() => {
      // initGame();
    });

    // 计算游戏开始时间
    const startTime = computed(() => {
      const second = Math.floor(state.time / 1000);
      return `${second} S`;
    });

    // 开始游戏
    const startGame = () => {
      state.options.row = Number(state.formOptions.row);
      state.options.col = Number(state.formOptions.col);
      state.options.boom = Number(state.formOptions.boom);
      state.options.second = Number(state.formOptions.second);
      // 初始化游戏数据
      initGame();
      setGameStatus(1);
      // 生成雷区
      generateThunder();
    };

    // 初始化游戏数据
    const initGame = () => {
      openNum = 0;
      state.mineList = [];
      const { col, row } = state.options;
      // Array fill方法填充的会有引用问题
      // state.mineList = new Array(row).fill(new Array(col).fill({ num: 0, status: 1, isThunder: false }));
      for (let i = 0; i < row; i++) {
        let arr = new Array(col).fill(null).map(() => ({ num: 0, status: 0, isThunder: false }));
        state.mineList.push(arr);
      }
    };

    // 生成雷区
    const generateThunder = () => {
      const { length: rowLen } = state.mineList;
      const { length: colLen } = state.mineList[0];
      // 炸弹数量
      let count = state.options.boom;
      while (count > 0) {
        const rowIndex = Math.floor(Math.random() * rowLen);
        const colIndex = Math.floor(Math.random() * colLen);
        const item = state.mineList[rowIndex][colIndex];
        // 如果不是雷，就放置一个雷
        if (!item.isThunder) {
          item.isThunder = true;
          count--;
          setMineNum(rowIndex, colIndex);
        }
      }
    };

    // 放置雷后，设置雷附近的数量+1
    const setMineNum = (rowIndex, colIndex) => {
      const setRowNum = (row) => {
        if (row) {
          row[colIndex - 1] ? row[colIndex - 1].num++ : '';
          row[colIndex] ? row[colIndex].num++ : '';
          row[colIndex + 1] ? row[colIndex + 1].num++ : '';
        }
      };
      // 上一行
      setRowNum(state.mineList[rowIndex - 1]);
      // 当前一行
      setRowNum(state.mineList[rowIndex]);
      // 下一行
      setRowNum(state.mineList[rowIndex + 1]);
    };

    // 计时
    let timer = null;
    let startTimeStamp = 0; // 开始的时间戳
    const setCountDown = () => {
      startTimeStamp = Date.now();
      state.time = 0;
      timer = setInterval(() => {
        state.time = Date.now() - startTimeStamp;
        console.log(state.time);
      }, 500);
    };

    // 停止计时
    const stopCountDown = () => {
      clearInterval(timer);
    };

    // 打开
    let openNum = 0;
    const openItem = (rowIndex, colIndex) => {
      if (openNum === 0) {
        // 开始计时
        setCountDown();
      }
      if (state.gameStatus !== 1) return;
      const item = state.mineList[rowIndex][colIndex];
      item.status = 1;
      openNum++;
      if (item.isThunder) {
        setGameStatus(2);
        return;
      }
      if (item.num === 0) {
      }
      // 检查游戏状态
      checkGameStatus();
    };

    /**
     * 获取附近8个有效的雷区索引
     * @param {Number} rowIndex
     * @param {Number} colIndex
     */
    const getNearbyIndex = (rowIndex, colIndex) => {
      const res = [];
      if (rowIndex - 1 > 0) {
        // res.push({
        //   rowIndex: 
        // })
      }
      return res;
    };

    /**
     * 设置游戏状态
     * @param {Number} status 0 未开始  1 进行中  2 失败  3 胜利
     */
    const setGameStatus = (status = 0) => {
      state.gameStatus = status;
      switch (status) {
        case 2:
          // 失败
          vant.Toast('Game over');
          stopCountDown();
          break;
        case 3:
          // 胜利
          vant.Toast('Victory');
          stopCountDown();
          break;

        default:
          break;
      }
    };

    // 检查游戏状态
    const checkGameStatus = () => {
      const { boom, row, col } = state.options;
      if (openNum + boom === row * col) {
        // 已全部打开，游戏胜利
        setGameStatus(3);
      }
    };

    return {
      ...toRefs(state),
      openItem,
      startGame,
      startTime,
    };
  },
};

const app = Vue.createApp(Main);
app.use(vant);
// app.use(Field);
// app.use(CellGroup);

app.mount('#app');
