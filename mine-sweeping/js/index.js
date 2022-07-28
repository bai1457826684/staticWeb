const { ref, reactive, toRefs, onMounted, computed } = Vue;
const { Field, CellGroup, Toast } = vant;

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
      startTimeStamp: 0, // 开始的时间戳
      endTimeStamp: 0, // 结束时间戳
      openNum: 0,
    });

    onMounted(() => {
      // initGame();
    });

    // 计算游戏开始时间
    const startTime = computed(() => {
      const second = Math.floor(state.time / 1000);
      return `${second} S`;
    });

    // 剩余数量
    const remainingNum = computed(() => {
      const { row, col, boom } = state.options;
      return row * col - state.openNum - boom;
    });

    // 旗帜数量
    const flagCount = computed(() => {
      let count = 0;
      state.mineList.forEach((col) => {
        col.forEach((item) => {
          if (item.status === 3) {
            count++;
          }
        });
      });
      return count;
    });

    // 开始游戏
    const startGame = () => {
      // 设置配置
      if (!setOptions()) return;
      // 初始化游戏数据
      initGame();
      setGameStatus(1);
      // 生成雷区
      generateThunder();
    };

    // 设置配置
    const setOptions = () => {
      const { row, col, boom, second } = state.formOptions;
      // 校验配置
      if (col < 1 || row < 1) {
        Toast('行数，列数不能小于1');
        return false;
      }
      if (boom < 1) {
        Toast('炸弹数不能小于1');
        return false;
      }
      if (row * col >= 2000) {
        Toast('设置行数列数过大');
        return false;
      }
      state.options.row = Number(row);
      state.options.col = Number(col);
      state.options.boom = Number(boom);
      state.options.second = Number(second);
      return true;
    };

    // 初始化游戏数据
    const initGame = () => {
      state.openNum = 0;
      state.time = 0;
      state.startTimeStamp = 0;
      stopCountDown();
      // 生成雷区
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
    const setCountDown = () => {
      state.startTimeStamp = Date.now();
      state.time = 0;
      timer = setInterval(() => {
        state.time = Date.now() - state.startTimeStamp;
      }, 500);
    };

    // 停止计时
    const stopCountDown = () => {
      clearInterval(timer);
      state.endTimeStamp = Date.now();
    };

    document.oncontextmenu = function (e) {
      return false;
      //或者 e.preventDefault()
    };

    // 右键
    const onMouseUp = (e, rowIndex, colIndex) => {
      if (e.button == 2) {
        console.log('右键');
        const item = state.mineList[rowIndex][colIndex];
        switch (item.status) {
          case 0:
            item.status = 3;
            break;
          case 2:
            item.status = 0;
            break;
          case 3:
            item.status = 2;
            break;

          default:
            break;
        }
      }
    };

    // 打开
    const clickItem = (rowIndex, colIndex) => {
      if (state.gameStatus !== 1) return;
      const item = state.mineList[rowIndex][colIndex];
      // 不是未打开状态的就不能点击
      if (item.status !== 0) return;
      if (state.openNum === 0) {
        // 开始计时
        setCountDown();
      }
      item.status = 1;
      state.openNum++;
      if (item.isThunder) {
        setGameStatus(2);
        return;
      }
      if (item.num === 0) {
        setNearbyStatus(rowIndex, colIndex);
      }
      // 检查游戏状态
      checkGameStatus();
    };

    const setNearbyStatus = (rowIndex, colIndex) => {
      const list = getNearbyIndex(rowIndex, colIndex);
      // console.log('status');
      list.forEach(({ rowIndex, colIndex }) => {
        // clickItem(rowIndex, colIndex);
        const item = state.mineList[rowIndex][colIndex];
        item.status = 1;
        state.openNum++;
      });

      list.forEach(({ rowIndex, colIndex }) => {
        const item = state.mineList[rowIndex][colIndex];
        if (item.num === 0) {
          setNearbyStatus(rowIndex, colIndex);
        }
      });
    };

    /**
     * 获取附近8个未开启的雷区索引
     * @param {Number} rowIndex
     * @param {Number} colIndex
     * @return {Array} 索引列表
     */
    const getNearbyIndex = (rowIndex, colIndex) => {
      // console.log('x, y', rowIndex, colIndex);
      const res = [];

      const filterOpenStatus = (rowIndex, colIndex) => {
        let res = null;
        if (state.mineList[rowIndex] && state.mineList[rowIndex][colIndex]) {
          res = state.mineList[rowIndex][colIndex].status === 0 ? { rowIndex, colIndex } : null;
        }
        return res;
      };

      let item = null;
      // 左 上
      item = filterOpenStatus(rowIndex - 1, colIndex - 1);
      item ? res.push(item) : '';
      // 中 上
      item = filterOpenStatus(rowIndex - 1, colIndex);
      item ? res.push(item) : '';
      // 右 上
      item = filterOpenStatus(rowIndex - 1, colIndex + 1);
      item ? res.push(item) : '';
      // 左 中
      item = filterOpenStatus(rowIndex, colIndex - 1);
      item ? res.push(item) : '';
      // 右 中
      item = filterOpenStatus(rowIndex, colIndex + 1);
      item ? res.push(item) : '';
      // 左 下
      item = filterOpenStatus(rowIndex + 1, colIndex - 1);
      item ? res.push(item) : '';
      // 中 下
      item = filterOpenStatus(rowIndex + 1, colIndex);
      item ? res.push(item) : '';
      // 右 下
      item = filterOpenStatus(rowIndex + 1, colIndex + 1);
      item ? res.push(item) : '';

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
          Toast('Game over');
          stopCountDown();
          break;
        case 3:
          // 胜利
          Toast('Victory');
          stopCountDown();
          break;

        default:
          break;
      }
    };

    // 检查游戏状态
    const checkGameStatus = () => {
      const { boom, row, col } = state.options;
      if (state.openNum + boom === row * col) {
        // 已全部打开，游戏胜利
        setGameStatus(3);
      }
    };

    return {
      ...toRefs(state),
      clickItem,
      startGame,
      startTime,
      flagCount,
      remainingNum,
      onMouseUp,
    };
  },
};

const app = Vue.createApp(Main);
app.use(vant);
// app.use(Field);
// app.use(CellGroup);

app.mount('#app');
