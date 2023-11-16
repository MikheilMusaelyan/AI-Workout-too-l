import './vl.css'

function Vl(){
    const lines = [
        [{class: 'black', delay: 0.6, speed: 0.5}],
        [{ class: 'yellow', delay: 0.5, speed: 1 }, { class: 'border', delay: 1, speed: 1.6 }],
        [{class: 'black', delay: 0, speed: 0.5}],
        [{class: 'pink', delay: 1, speed: 1}],
        [{class: 'black', delay: 1, speed: 0.7}],
        [{class: 'blue', delay: 1, speed: 1.8}],
        [{class: 'black', delay: 0, speed: 0.5}, {class: 'black', delay: 1, speed: 0.5}],
        [{class: 'black', delay: 1, speed: 0.2}]
      ];

    return (
        <>       
            <div className="vertical-line-wrap">
                {
                    lines.map((item: any[], index: number) => (
                        <div className="vertical-line" key={index}>
                            {
                                item.map((item: any, index: number) => (
                                    <div 
                                    key={index}
                                    className={`vl ${item?.class}`}
                                    style={
                                        {
                                            transitionDelay: item?.delay,
                                            transition: item?.speed
                                        }
                                    }
                                    ></div>
                                ))
                            }
                        </div>
                    ))
                }  
            </div>
        </>
    )
}

export default Vl