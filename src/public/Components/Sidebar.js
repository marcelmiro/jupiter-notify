'use strict'
window.Vue.component('Sidebar', {
    props: { page: String },
    data: function () {
        return { active: false }
    },
    template: `
        <nav :class="{ active }">
            <div class="sidebar">
                <div class="sidebar__header">
                    <div class="sidebar__header__content">
                        <a href="/"><img src="/assets/logo_icon.png" alt="Logo"></a>
                        <button class="hamburger" :class="{ active }" @click="toggle">
                            <span class="line line-1"></span>
                            <span class="line line-2"></span>
                            <span class="line line-3"></span>
                        </button>
                    </div>
                </div>
                
                <div class="sidebar__container">
                    <div class="links">
                        <a href="/admin" :class="{'active' : page && page.toLowerCase() === 'overview'}">
                            <svg width="100%" height="100%" viewBox="0 0 50 51" version="1.1" xmlns="http://www.w3.org/2000/svg"
                         xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                         style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                                <g transform="matrix(2.41655,0,0,2.41655,-0.0676633,-1.27473)">
                                    <path
                                        d="M12.925,1.37C13.336,1.37 13.675,1.709 13.675,2.12C13.675,2.493 13.397,2.812 13.027,2.863L12.925,2.87L5.657,2.87C3.202,2.87 1.623,4.496 1.532,7.03L1.528,7.263L1.528,15.345C1.528,17.947 3.011,19.629 5.434,19.725L5.657,19.729L14.261,19.729C16.718,19.729 18.295,18.109 18.386,15.577L18.39,15.344L18.39,8.304C18.39,7.893 18.729,7.554 19.14,7.554C19.513,7.554 19.832,7.832 19.883,8.202L19.89,8.304L19.89,15.344C19.89,18.744 17.75,21.116 14.496,21.224L14.262,21.228L5.657,21.228C2.327,21.228 0.132,18.928 0.032,15.584L0.028,15.344L0.028,7.264C0.028,3.872 2.17,1.484 5.422,1.364L5.656,1.36L12.924,1.36L12.925,1.37ZM15.04,8.2C15.333,8.426 15.416,8.837 15.235,9.16L15.175,9.253L12.245,13.033C12.018,13.327 11.604,13.41 11.281,13.226L11.188,13.164L8.368,10.95L5.838,14.25C5.612,14.543 5.202,14.628 4.879,14.448L4.786,14.388C4.493,14.162 4.408,13.752 4.588,13.429L4.648,13.336L7.641,9.436C7.868,9.141 8.282,9.057 8.606,9.241L8.699,9.303L11.519,11.518L13.986,8.335C14.238,8.01 14.713,7.949 15.038,8.201L15.04,8.2ZM17.995,0.528C18.012,0.528 18.029,0.528 18.047,0.528C19.513,0.528 20.719,1.734 20.719,3.2C20.719,4.665 19.513,5.872 18.047,5.872C18.029,5.872 18.012,5.871 17.995,5.871C16.549,5.843 15.375,4.646 15.375,3.2C15.375,1.753 16.549,0.556 17.995,0.528ZM17.995,2.028C17.352,2.028 16.822,2.557 16.822,3.201C16.822,3.844 17.352,4.373 17.995,4.373C18.638,4.373 19.168,3.844 19.168,3.201C19.168,2.557 18.638,2.028 17.995,2.028Z"
                                        style="fill-rule:nonzero;"/>
                                </g>
                            </svg>
                            <span>Overview</span>
                        </a>
                        <a href="/admin/members" :class="{'active' : page && page.toLowerCase() === 'members'}">
                            <svg width="100%" height="100%" viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg"
                         xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                         style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                                <g transform="matrix(0.0976562,0,0,0.0976562,0,0)">
                                    <path
                                        d="M331.225,237.405C363.986,213.512 387.282,174.844 387.282,131.282C387.282,58.893 328.389,0 256,0C183.611,0 124.718,58.893 124.718,131.282C124.718,174.844 147.935,213.512 180.697,237.405C99.257,268.57 39.385,347.531 39.385,439.795C39.385,479.609 71.776,512 111.59,512L400.41,512C440.224,512 472.615,479.609 472.615,439.795C472.615,347.531 412.665,268.57 331.225,237.405ZM162.265,131.282C162.265,80.61 205.328,36.864 256,36.864C306.672,36.864 349.657,80.61 349.657,131.282C349.657,181.954 306.672,225.28 256,225.28C205.328,225.28 162.265,181.954 162.265,131.282ZM400.41,475.136L111.59,475.136C93.493,475.136 76.249,457.892 76.249,439.794C76.249,342.068 158.274,260.096 256.001,260.096C353.728,260.096 435.673,342.067 435.673,439.794C435.672,457.892 418.508,475.136 400.41,475.136Z"
                                        style="fill-rule:nonzero;"/>
                                </g>
                            </svg>
                            <span>Members</span>
                        </a>
                        <a href="/admin/restocks" :class="{'active' : page && page.toLowerCase() === 'restocks'}">
                            <svg width="100%" height="100%" viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg"
                         xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                         style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                                <g transform="matrix(0.094727,0,0,0.0955625,0.749814,0.53565)">
                                    <path
                                        d="M206.387,208.254C186.901,151.797 199.691,86.675 244.763,41.603C307.708,-21.341 409.763,-21.341 472.708,41.603C535.653,104.548 535.654,206.6 472.709,269.549C428.703,313.555 365.583,326.793 310.083,309.262L107.316,512.029C102.965,516.379 96.782,518.363 90.713,517.355L18.588,505.376C10.263,503.993 3.838,497.302 2.794,488.929L-7.768,404.226C-8.93,394.902 -3.126,386.121 5.909,383.538L35.758,375.004L44.29,345.156C46.1,338.825 51.049,333.876 57.38,332.067L87.225,323.536L95.756,293.691C97.566,287.359 102.515,282.41 108.846,280.601L138.69,272.071L147.22,242.227C149.029,235.895 153.979,230.946 160.311,229.136L195.583,219.058L206.387,208.254ZM87.288,478.137L291.664,273.761C297.084,268.341 305.223,266.695 312.323,269.581C356.786,287.657 409.677,278.661 445.749,242.59C493.804,194.532 493.805,116.618 445.748,68.563L445.748,68.563C397.693,20.507 319.778,20.507 271.723,68.563C234.767,105.519 226.234,160.127 246.116,205.242C249.288,212.44 247.713,220.847 242.151,226.409L219.05,249.51C216.759,251.8 213.922,253.47 210.808,254.36L180.968,262.886L172.439,292.729C170.63,299.06 165.681,304.01 159.349,305.819L129.504,314.35L120.973,344.195C119.163,350.527 114.214,355.476 107.883,357.285L78.038,365.816L69.506,395.663C67.696,401.993 62.748,406.942 56.417,408.752L32.086,415.708L38.868,470.095L87.288,478.137ZM472.708,41.603L472.708,41.603L472.708,41.603Z"/>
                                </g>
                                <g transform="matrix(0.930284,0.930284,-0.751742,0.751742,9.93104,-36.0736)">
                                    <path
                                        d="M40.924,8.44C38.179,8.44 36.077,10.855 36.077,13.6C36.077,16.346 38.179,18.761 40.924,18.761C43.669,18.761 45.772,16.346 45.772,13.6C45.772,10.855 43.669,8.44 40.924,8.44ZM40.924,11.701C42.08,11.701 43.137,12.444 43.137,13.6C43.137,14.757 42.08,15.5 40.924,15.5C39.768,15.5 38.712,14.757 38.712,13.6C38.712,12.444 39.768,11.701 40.924,11.701Z"/>
                                </g>
                            </svg>
                            <span>Restocks</span>
                        </a>
                        <a href="/admin/roles" :class="{'active' : page && page.toLowerCase() === 'roles'}">
                            <svg width="100%" height="100%" viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg"
                         xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                         style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                                <g transform="matrix(0.0976562,0,0,0.0976562,0,-0.00039027)">
                                    <path
                                        d="M420.565,256.001C410.466,256.001 402.28,264.187 402.28,274.286L402.28,457.14C402.28,467.24 394.093,475.426 383.994,475.426L54.856,475.426C44.757,475.426 36.571,467.24 36.571,457.14L36.571,91.431C36.571,81.332 44.757,73.145 54.856,73.145L274.282,73.145C284.381,73.145 292.568,64.959 292.568,54.86C292.568,44.76 284.381,36.575 274.282,36.575L54.856,36.575C24.56,36.575 0,61.135 0,91.431L0,457.14C0,487.437 24.56,511.997 54.856,511.997L383.995,511.997C414.291,511.997 438.851,487.437 438.851,457.14L438.851,274.285C438.851,264.187 430.665,256.001 420.565,256.001Z"
                                        style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(0.0976562,0,0,0.0976562,0,-0.00039027)">
                                    <path
                                        d="M491.503,20.509C478.374,7.378 460.566,0.002 441.997,0.004C423.418,-0.049 405.591,7.339 392.499,20.521L151.642,261.358C149.643,263.371 148.136,265.818 147.235,268.507L110.664,378.22C107.473,387.802 112.653,398.156 122.234,401.346C124.093,401.966 126.04,402.282 127.999,402.284C129.961,402.281 131.913,401.966 133.777,401.352L243.49,364.781C246.184,363.881 248.632,362.366 250.639,360.356L491.495,119.5C518.832,92.166 518.836,47.846 491.503,20.509ZM465.64,93.662L227.928,331.373L156.908,355.089L180.55,284.159L418.353,46.449C431.426,33.401 452.603,33.423 465.651,46.496C471.883,52.741 475.395,61.196 475.422,70.019C475.444,78.889 471.923,87.401 465.64,93.662Z"
                                        style="fill-rule:nonzero;"/>
                                </g>
                            </svg>
                            <span>Roles</span>
                        </a>
                        <a href="/admin/products" :class="{'active' : page && page.toLowerCase() === 'products'}">
                            <svg width="100%" height="100%" viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg"
                         xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                         style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                                <g transform="matrix(1.05857,0,0,1.06365,-0.364473,-2.11505)">
                                    <path
                                        d="M2.84,13.185C2.307,12.918 1.673,12.945 1.165,13.257C0.657,13.568 0.348,14.119 0.347,14.713L0.344,35.836C0.344,36.472 0.699,37.056 1.265,37.351L23.124,48.764C23.657,49.043 24.298,49.023 24.813,48.713C25.328,48.403 25.643,47.848 25.643,47.249L25.642,25.653C25.642,25.006 25.276,24.414 24.695,24.124L2.84,13.185ZM3.784,34.801L22.203,44.418L22.203,26.708L3.787,17.49L3.784,34.801Z"/>
                                </g>
                                <g transform="matrix(1.05857,0,0,1.06365,-2.52111,-2.11505)">
                                    <path
                                        d="M24.32,47.247C24.32,47.846 24.635,48.402 25.15,48.711C25.665,49.021 26.306,49.041 26.839,48.762L48.694,37.351C49.261,37.056 49.615,36.472 49.615,35.836L49.614,14.715C49.614,14.122 49.305,13.57 48.797,13.259C48.289,12.947 47.655,12.92 47.122,13.186L25.265,24.123C24.684,24.414 24.318,25.006 24.318,25.653L24.32,47.247ZM27.757,26.707L27.759,44.416L46.176,34.801L46.175,17.492L27.757,26.707Z"/>
                                </g>
                                <g transform="matrix(1.05857,0,0,1.06365,-1.36985,-0.536763)">
                                    <path
                                        d="M24.206,25.382C24.692,25.625 25.265,25.625 25.751,25.382L47.379,14.56C47.96,14.269 48.327,13.678 48.327,13.031C48.327,12.384 47.96,11.792 47.379,11.502L25.769,0.687C25.283,0.444 24.71,0.444 24.224,0.687L2.578,11.502C1.997,11.792 1.63,12.384 1.63,13.031C1.63,13.678 1.996,14.27 2.577,14.56L24.206,25.382ZM7.181,13.032L24.979,21.937L42.779,13.031L24.995,4.132L7.181,13.032Z"/>
                                </g>
                                <g transform="matrix(1.01136,0,0,1.01621,1.15583,-0.506364)">
                                    <path
                                        d="M33.979,20.177L12.862,9.611C11.974,9.167 11.616,8.09 12.062,7.206C12.508,6.323 13.591,5.966 14.479,6.41L35.932,17.144C36.154,17.255 36.35,17.41 36.508,17.6L37.407,18.677C37.674,18.997 37.82,19.399 37.822,19.815L37.855,24.953C37.859,25.942 37.055,26.748 36.061,26.751C35.068,26.754 34.259,25.954 34.255,24.965L34.224,20.47L33.979,20.177Z"/>
                                </g>
                            </svg>
                            <span>Products</span>
                        </a>
                        <a href="/admin/logs" :class="{'active' : page && page.toLowerCase() === 'logs'}">
                            <svg width="100%" height="100%" viewBox="0 0 50 51" version="1.1" xmlns="http://www.w3.org/2000/svg"
                         xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                         style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                                <g transform="matrix(2.32558,0,0,2.32558,-0.581395,-0.569541)">
                                    <path
                                        d="M15.686,0.25C19.332,0.25 21.75,2.848 21.75,6.585L21.75,15.415C21.75,19.152 19.33,21.75 15.686,21.75L6.316,21.75C2.67,21.75 0.25,19.152 0.25,15.415L0.25,6.585C0.25,2.85 2.675,0.25 6.314,0.25L15.686,0.25ZM15.686,1.75L6.316,1.75C3.53,1.75 1.752,3.657 1.752,6.585L1.752,15.415C1.752,18.347 3.524,20.25 6.316,20.25L15.686,20.25C18.478,20.25 20.25,18.347 20.25,15.415L20.25,6.585C20.25,3.653 18.478,1.75 15.686,1.75Z"
                                        style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(0.868269,0,0,0.868269,4.86825,3.87325)">
                                    <path
                                        d="M30.555,26.708L39.285,26.708C40.279,26.708 41.085,25.901 41.085,24.908C41.085,23.914 40.279,23.108 39.285,23.108L30.555,23.108C29.562,23.108 28.755,23.914 28.755,24.908C28.755,25.901 29.562,26.708 30.555,26.708Z"/>
                                </g>
                                <g transform="matrix(0.868269,0,0,0.868269,1.71567,3.78318)">
                                    <path
                                        d="M23.103,24.995L9.916,18.432C9.027,17.989 8.664,16.908 9.107,16.018C9.55,15.129 10.631,14.766 11.52,15.209L27.937,23.38C28.547,23.684 28.934,24.307 28.934,24.989C28.935,25.672 28.55,26.296 27.94,26.601L11.524,34.813C10.635,35.257 9.553,34.897 9.108,34.008C8.664,33.12 9.025,32.037 9.913,31.593L23.103,24.995Z"/>
                                </g>
                            </svg>
                            <span>Logs</span>
                        </a>
                        <a href="/admin/settings" :class="{'active' : page && page.toLowerCase() === 'settings'}">
                            <svg width="100%" height="100%" viewBox="0 0 50 51" version="1.1" xmlns="http://www.w3.org/2000/svg"
                         xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                         style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                                <g transform="matrix(2.41289,0,0,2.41289,0.468066,-1.26215)">
                                    <path
                                        d="M10.797,0.528C11.517,0.528 12.207,0.818 12.707,1.335C13.207,1.852 13.48,2.548 13.457,3.199L13.467,3.352C13.485,3.502 13.534,3.648 13.613,3.782C13.768,4.046 14.023,4.238 14.318,4.315C14.613,4.392 14.93,4.348 15.218,4.173L15.384,4.087C16.631,3.503 18.135,3.975 18.824,5.167L19.446,6.247C19.462,6.275 19.477,6.305 19.489,6.335L19.547,6.451C20.097,7.623 19.716,9.036 18.65,9.771L18.39,9.935C18.253,10.03 18.14,10.155 18.054,10.305C17.899,10.57 17.857,10.885 17.936,11.183C18.015,11.481 18.209,11.733 18.504,11.903L18.674,12.013C19.186,12.371 19.556,12.899 19.717,13.503C19.899,14.188 19.8,14.919 19.441,15.531L18.771,16.646L18.671,16.803C17.884,17.933 16.357,18.28 15.191,17.607L15.053,17.537C14.909,17.473 14.753,17.437 14.613,17.433C14.305,17.431 14.01,17.553 13.793,17.771C13.569,17.999 13.446,18.308 13.454,18.628L13.446,18.806C13.333,20.18 12.17,21.25 10.792,21.25L9.538,21.25C8.068,21.25 6.875,20.058 6.876,18.634L6.866,18.481C6.847,18.326 6.796,18.178 6.716,18.044C6.564,17.779 6.313,17.586 6.018,17.507C5.723,17.428 5.408,17.47 5.105,17.647L4.925,17.747C3.674,18.308 2.184,17.817 1.511,16.622L0.87,15.494L0.784,15.328C0.194,14.084 0.657,12.588 1.829,11.912L1.936,11.845C2.249,11.628 2.436,11.271 2.436,10.889C2.436,10.473 2.214,10.089 1.826,9.865L1.669,9.765C0.537,8.973 0.198,7.427 0.894,6.234L1.554,5.151C2.273,3.893 3.897,3.445 5.16,4.156L5.295,4.228C5.433,4.291 5.583,4.325 5.727,4.326C6.363,4.326 6.881,3.816 6.891,3.161L6.891,2.961C7.006,1.594 8.163,0.53 9.535,0.529L10.797,0.528ZM10.797,2.028L9.543,2.028C9.236,2.028 8.943,2.15 8.725,2.368C8.54,2.552 8.423,2.794 8.395,3.053L8.381,3.369C8.274,4.751 7.106,5.83 5.72,5.827C5.344,5.822 4.974,5.735 4.635,5.574L4.44,5.471C4.264,5.371 4.065,5.318 3.863,5.318C3.441,5.318 3.051,5.547 2.845,5.915L2.185,6.998C1.883,7.522 2.035,8.19 2.502,8.516L2.767,8.684C3.499,9.179 3.938,10.007 3.937,10.89C3.937,11.765 3.507,12.583 2.764,13.096L2.606,13.196C2.086,13.496 1.884,14.148 2.126,14.66L2.183,14.76L2.823,15.862C2.973,16.132 3.225,16.332 3.523,16.417C3.775,16.49 4.046,16.475 4.288,16.373L4.388,16.319C4.998,15.963 5.723,15.866 6.405,16.049C7.087,16.232 7.667,16.679 8.011,17.279C8.196,17.591 8.313,17.939 8.359,18.339L8.379,18.705C8.443,19.292 8.945,19.741 9.535,19.741L10.789,19.741C11.395,19.741 11.889,19.275 11.946,18.704L11.952,18.591C11.949,17.883 12.228,17.203 12.729,16.701C13.23,16.199 13.909,15.921 14.635,15.924C14.991,15.934 15.34,16.014 15.698,16.174L16.018,16.338C16.521,16.558 17.118,16.398 17.421,15.964L17.495,15.849L18.149,14.749C18.304,14.484 18.346,14.167 18.267,13.871C18.201,13.618 18.051,13.396 17.841,13.241L17.727,13.168C17.115,12.816 16.668,12.234 16.487,11.551C16.305,10.871 16.402,10.145 16.755,9.536C16.948,9.199 17.215,8.909 17.56,8.669L17.723,8.566C18.243,8.262 18.443,7.612 18.203,7.098L18.131,6.96L18.118,6.93L17.524,5.9C17.253,5.427 16.684,5.204 16.164,5.368L16.051,5.413L15.946,5.466C15.339,5.824 14.614,5.926 13.932,5.748C13.251,5.572 12.668,5.131 12.312,4.525C12.122,4.201 12.003,3.84 11.964,3.467L11.951,3.207C11.961,2.893 11.841,2.587 11.621,2.363C11.401,2.139 11.101,2.011 10.786,2.011L10.797,2.028ZM10.175,7.503C10.202,7.502 10.229,7.502 10.256,7.502C12.114,7.502 13.642,9.031 13.642,10.888C13.642,12.746 12.114,14.274 10.256,14.274C10.229,14.274 10.201,14.274 10.173,14.273C8.355,14.218 6.889,12.707 6.889,10.889C6.889,9.068 8.357,7.557 10.176,7.504L10.175,7.503ZM10.175,9.003C10.175,9.003 10.175,9.003 10.174,9.003C9.14,9.003 8.289,9.854 8.289,10.888C8.289,11.923 9.14,12.774 10.174,12.774C10.174,12.774 10.174,12.774 10.174,12.774C11.209,12.774 12.06,11.923 12.06,10.888C12.06,9.854 11.209,9.003 10.175,9.003Z"
                                        style="fill-rule:nonzero;"/>
                                </g>
                            </svg>
                            <span>Settings</span>
                        </a>
                        
                        <a href="/logout">
                            <svg width="100%" height="100%" viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg"
                         xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
                         style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                                <g>
                                    <g transform="matrix(2.5,0,0,2.5,-0.625,-0.587801)">
                                        <path
                                            d="M10.25,20.251L6.166,20.251C2.683,20.25 0.25,17.982 0.25,14.585L0.25,5.915C0.25,2.512 2.68,0.25 6.166,0.25C6.166,0.25 6.166,0.217 10.25,0.25C11.434,0.26 11.434,1.73 10.25,1.73C6.166,1.73 6.166,1.75 6.166,1.75C3.486,1.75 1.75,3.365 1.75,5.916L1.75,14.586C1.75,17.13 3.49,18.751 6.166,18.751L10.25,18.73C11.436,18.73 11.436,20.251 10.25,20.251Z"/>
                                    </g>
                                    <g transform="matrix(2.89502,0,0,2.89502,6.32345,-4.67148)">
                                        <path
                                            d="M11.102,14.53L11.018,14.602C10.72,14.821 10.303,14.789 10.042,14.527L9.97,14.443C9.751,14.145 9.783,13.728 10.045,13.467L12.522,11L6.165,11L6.063,10.993C5.693,10.942 5.415,10.623 5.415,10.25C5.415,9.839 5.753,9.5 6.165,9.5L12.525,9.5L10.044,7.034L9.971,6.95C9.75,6.653 9.78,6.235 10.042,5.973L10.041,5.972C10.181,5.831 10.373,5.751 10.572,5.751C10.771,5.751 10.961,5.83 11.102,5.97L14.863,9.721L14.864,9.721L14.937,9.804L15.01,9.921L15.049,10.016L15.074,10.114L15.087,10.267L15.075,10.387L15.049,10.487L15.009,10.585L14.964,10.662C14.936,10.705 14.903,10.744 14.867,10.78L11.102,14.53Z"/>
                                    </g>
                                </g>
                            </svg>
                            <span>Log Out</span>
                        </a>
                    </div>
                </div>
            </div>
            
            <button class="hamburger mobile" :class="{ active }" @click="toggle">
              <span class="line line-1"></span>
              <span class="line line-2"></span>
              <span class="line line-3"></span>
            </button>
        </nav>
    `,
    methods: {
        toggle: function () { this.active = !this.active }
    }
})