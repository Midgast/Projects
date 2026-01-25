,{ useState, useEfect } fRousNavigae  omoe
functionSimpleLogin() 
 con[email,setEail]= useState(admin@altamimilocl");
  cons [password, setPassword] = seSate("admin");
  cs [rror, seError] = ueState(")  cns[loading,setad]=useState(alse);

  cnsthndl = sync () => {
    epreventDefault()    setLoadng(true);
    setErr("");

    ry
   const espnse= await fetch(http:/localhost:4005/apauth/login", {
        method: "POT",
        aders: {
          "Content-Type": "appication/on,        },
        body: JSON.strngify({ eail, asswd }),
      });

      consdata= wit sponse.json();

    i (espnseok) {
        loclStora.etItem("token", dta.tken);
        loclStoetItem(user", JSON.stringify(data.user))        wndw.locaion.href= "/";
      } else 
       stError(ata.error || "Login faid");
      }
    } ctch (rr){
     setErr("Networkerror Ple try ain)    } fnally
     setLadig(fs);
    }
 ;

 un (
    <div sy={{
      inHigh: "100h"
   disly: "flx",
      inItm: "center,      justfyCntent: "cente",
     background:"linar-grdient(135de, #667ea 0%, #764ba2 100%)",
    ntFaily:system-ui, -apl-sytm, ns-srif    }>      <divstyl={{
        bkground: "gb255, 255, 255, 0.1)"  bacdropFiltr"bu(10px)" brdeRadius: "20px",
      pdin: "3rm",
      boxShadw:0 20px 60x rgb(0, 0, 0, 0.3)",
        bordr: "1px oli rb(255, 255, 255, 02)",
        maxWidth: "400p,        wdth: "100%"
      }>      <h1styl={{
          olo: "whit",
          xtAign: "centr",
          argiBotom: "2rem"  fontSiz "2rem",
         fonWegh: "bold"
        }}>
          AL TAMIMI Coleg       </h1>

<fm onSubmi={handleLogin}>
        <dv syle={{ mrinBottom:"1e"}>
            <input
              type=mail              plholdr="mai"
              valu={mail}
              oChange={(e) => seEmaile.tagt.value)}
              stle={{
                width"100%"        pddng: "1rem"            bordrRdius: "10px",
                bodr: "1px solid rgb255 255, 255, 0.3)",                bacground "rgb(255255 255, 0.1)",
                clo"white"
                fontSize"1rm"
                mrinBottom"1rm"
            }}
              rqird
            />
          </div>

          <div sye={{mrinBottom: "1rm }}>            <inut
              type="passwd"
            pleholde="Passwrd"
              vaue={passwrd}
              onChn={( => stPssword(etagt.vlue)}
              syl={{
                widh: "100%",
                adding: "1rem"
                bordrRdiu: "10px",
                ber1x solid rgb(255, 255, 255, 0.3)"
                bkgound "rgba(255,25525501)"
                color"white,                fontSze: "1re"
                 
        }             eqird
            />
          </div>
          {  (
            <div sy={{
            color "#ff6b6b"
             argBttm:"1rem
              txtAlign: "ene",
              fonSiz: "0.9r"
            }}>
              {rror}
            </div>
          )}

          <
           typ="bit"
            disabled={loading}
            style={{
              wdth: "100%"
              adding"1rem"
              borderRadius"10px"
              bordr"ne",
              backgrund: odin ? "#666" : "#4CAF50,              clo: "whie",
              fontSze: "1rem",
              ontWeght: "bold",
              ursor: loding ? "no-allowed" : "pot",
              transitin:all 03s es"
            }
          >
            {lodng ? "Sgn in..:"Sign In"}          </button>        </fo>

        <style={         clr"rgba(255,255,255, 0.8)",
          txtAlig: "cener",
          mrinTop: "1rm",
        ntSize:09rem
        }}>
          Demo: admin@altamimilocal / admin
        </div>
      </div>
    </div>
  ;
}

ionSimplDashboar) 
 onst [use, stUser] = useState(ull);

 useEffect((=>   userData= localSrag.getItem("user");
 if (rData) {
      setUser(JSON.parse(serDaa));
    }
  }, []);

  const andleLogout =  => {  localStoag.emoveIem("t");
  loaStoag.removeItem("user");
  window.loaionhf = "/ogin";
  };

  if (!usr) {
    rtur < = />
   (
    <div sy={minHigh:"100vh",  backgrnd: "linear-gradien(135deg, #13c72 0%, #2a5298 100%)",fntFamily: "sysm-ui,-pple-sysem, sans-serif,
      cor: "whte }}>  <stl={{  backroud: "rba(255, 255,255,0.1)",  backdrpFilr: "blur(10px)",dding: 1rem 2rem, display:"fx",
        justifyContt: "space-beween",alignIms: "enr"  }}><h1styl={{ fonSize: "15m", argi: 0 }}>   ALTAMIMIDashboard</h1>     <divstyle={{display:"flex" alignItems:"center,gap:"1rem }}>    <span>Wlom, {usr.fulNa}</spa> <bt  onClick={hndLogou       sy={    padding"0.5r 1rm"  brderRadus8px,       border:"1pxolid gba(255, 255, 255, 0.3"            bkground: "gb24467,54,0.8)",
     cor: "whie"   crsorpinte
           }          >            Logou
          </buo>
       </div>
      </hader>

     <a sy={{pddin: "2rm"}}><h2styl={{ fonSize: "2m", mrginBotom: "2r"}}> W o Dashboard!
        </h2>

        <dv sy={{disply: "gid,
         gridTmpatClumns: rep(uto-fi, imax300px1fr))", gp: "2rem"}}>
<div sty={{bkgound: "rgb255, 255, 2550.1)",  bacdropFiltr"blur(0px)"orrRiu:"15px",   padding:"2rem",  border:"1pxsolidgb255255, 255, 0.2)"}}><h3 syle={{foSze:"1.3r", argBotom: "1rm"}>   T</h3><pstyle={{fnSiz:"2rem, fonWig: "bd,in: 0 }}>
         </p>
</div>
<divstyle={{
bkgoud: "rgba255255, 255, 0.1)",bacdropFiltr"bur(10px)"brdrRdus: 15px,
            pddig: 2"bordr"1px soid rgba(255 255, 255, 0.2)"}}>
        <h3 style={{ fnSiz:1.3m,giBottom:1rem}}>
   Prformn
            </h3>
            <p sy={{ foSize: "2rm"foWigh"bod", mar: 0 }}>        85%      </p>    </div> </iv></main></div>
);
}

xporfunion App() {
  urn    <Routes>      <ou ph="/login" ={<SimplLogin />}/><Routep="/" eement={<SimpeDashboard />} /><Routepath="/*"={<Nvigo="/" eplace/> /></Routes>}