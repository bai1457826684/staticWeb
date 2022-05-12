var baseURL = 'https://netease-cloud-music-api-crete722p-hannah-bingo.vercel.app';
axios.defaults.baseURL = baseURL;

var vm = new Vue({
    el: "#app",

    data: function () {
        return {
            query: "",
            musicList: [],
        };
    },

    methods: {
        getMusicList(params) {
            axios({
                method: 'get',
                url: '/top/playlist/highquality',
                params: {
                    limit: 20,
                    cat: '',
                    before: '',
                },
            }).then(res => {
                console.log(res);
            })
        }
    },

    mounted: function () {
        console.log('mounted', this, vm);
        this.getMusicList()
    },
});
