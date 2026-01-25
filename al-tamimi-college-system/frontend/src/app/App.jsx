,{ useState, useEfect } fRousNaviga// Sle Lgin Componen
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
    } ctch (rr) {
    setErro("Netwrkerror Ple try ain)    } fnally
     setLadig(fs);
    }
 ;

 retun (
    <div style={{
      inHeight:"100vh,
      disly: "flx",
      inItm: "center,      justfyCntent: "cente",
     background:"linar-grdient(135de, #667ea 0%, #764ba2 100%)",
    ntFaily:system-ui, -apl-sytm, ns-srif
    }}>      <dv style={{
        backgrund: "rgba(255, 255, 255, 0.1)",
        backdopFiler: "blur(10px)",
      borderRiu: "20px",
        pddin: "3rm",
      boxShadw:0 20px 60x rgb(0, 0, 0, 0.3)",
        bordr: "1px oli rb(255, 255, 255, 02)",
        maxWidth: "400p,        wdth: "100%"
      }}>
        <h1 style={{
          col: "whie",
        textlg: "ceer",
          mrinBottom: "2rm",
        ontSize: "2e",
         fontWeight: bold"
        }}>
          AL TAMIMI Colle
        <h1>

        <for oSubmit={hndeLogn}>
          <div tyle={{ mrinBottom: "1rm }}>            <nput
              type="eail"
              lacehlde="Email"
            vale={mi}
              onChne={()=>setEail(etr.val)}
              sye={{
                width: "100%",
                pddin: "1rem",
                bordrRadiu: "10p,                border: "1x slid gba(255,255,255, 0.3)",
                bkgund: "rgba(255, 255, 255, 0.1)",
                cor: "white",
                fontSize: "1rem",
                mrinBottom: "1rm"
             }
              required
            />
          </div>

          <div style={{maginBottm: "1re" }}>
            <input
             type=sword"
              pleold="Password"
              value={passwrd}
              nChange={(e) => etssword(e.tartvalue)}
              tyle={{
                width: "100%,                paddng: "1re",
                borderRadius: "10px",
                border: "1x slid gba(255, 255, 255, 0.3)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "whie",
                fontSize: "1rem"
             }}
              required
            />
          </div>

          error&& (
            <iv style={{
              color: "#ff6b6b",
              argBttm: "1rem",
              textAin: "cnter",
            ntSize:09rem"
            }}>
              {error}
            <div>
          )}

          <button
            tye="submit"
            disabled={lodin}
            styl={{
              width: "100%",
              pading: "1re",
              borderRadus: "10px",
              border: "ne",
              backgrund: odin ? #666" : "#4CAF50",              clo: "whie",
            fontSze: "1rem",
              ontWeght: "bold",
              ursor: loding ? "no-allowed" : "potr",
            tansitin:all 03s es"
            }}
          >
            {lodng ? "Sgn in.." : "Sign In}
          </button>        </fm>

        <div syle={{
        colo: "rgba(255, 255, 255, 0.8)",
          txtAlig: "cener",
          mrinTop: "1rm",
        ntSize:09rem"
        }}>
          Demo: admin@altamimilocal / admin
        </div>
      </div>
    </div>
  );
}

/ Siml Dahbod ComponSimplDashboar) 
 onst [use, stUser] = useState(ull);

 useEffect(( =>  st uerDaa=localSrage.getItem("usr");
  if(serData) {
      setUser(JSON.par(serDaa));
    }
  }, []);

  const andleLogout =  => {  localStoag.emoveIem("t");
  loaStorage.removeItem("user");
    winow.location.hf = "/logi";
};

  if (!user) {
    return     er
   <div style={    minHigh:"100vh",  backgrnd: "linear-gradien(135dg, #1e3c72 0%, #2a5298 100%)",fnFamily: "systm-ui,-pple-sysem, sans-serif,
      cor: "whte
   }}>
      <hadr syle{
        backroud: "rba(255,255,255, 0.1)",  backdrpFilr: "blur(10px)",dding: 1rem 2rem, display:"fx",
        justifyContt: "space-beween",alignIms: "enr"  }}>
h1 style={{ fontize: "1.5rm", margin: 0 }}ALTAMIMIDashbard</h1>
div syl={{disly: flex,aignIts: "cer", gap: "1rem" }}>
          spn>Welcome, {ue.fullNm<span      <button
onClick={handleLogt}
            syl={{
             dding: "0.5rem 1rem,
              borerRdiu: "8px",
              er: 1pxsoid rgb(255, 255, 255, 0.3)",
              ckgoun: "rba(244, 67, 54, 0.8)",
              color: "whit",
             cursor: "pointer"
            }
         Logout
      /bon>
        <div>
      </ar>

     <ai sy={{ pddin: "2rm"}<h2style={{fnSiz:"2rem", mrginBotm: "2em}}>
          Wco  Dshbord!
      <h2
<divstyle={{
  disly: grid,
         gridTmpatColu: "repet(auto-fit, minmax(300px, 1fr))",
          ap: "2rm"
      }}<divstyle={{
       backgrnd: "rgba(255, 255, 255, 0.1)",
            backdropFilr:"blur(10x),
            orrRadiu: 15px",
           pdin: "2rm",
            border: "1px olid rba(255,255,255, 0.2)"}}>
      h3syle{{ foSze:"1.3r", argBotom: "1rm"}T
          <h3<pstyle={{fnSiz:"2rem, fonWig: "bd,in: 0 }}>
              3
           <p
         <div
       <divstyle={{
backgrnd: "rgba(255, 255, 255, 0.1)",
            backdropFilr:"blur(10x),
            borderRu: "15px,
           padg: "2rem",
            brder: "1px sid rgb(255, 255,255,0.2)"      }}>
h3 style={{ fnSize: "1.3rm",mrnBotm: 1r" }}>
              Prforc
          <h3<pstyle={{fnSiz:2m", fotWeigh: "bold,gi: 0}            85%
p      </div>
div</main>
div>
  );
}

export function App() {
  retun (
    <Routes>
      <Rute pah="/login" elemn={<SimplLogin />} / <Routepath="/"element={<SimpleDashboard/> />      <Routepath="/*"element={<Navigateto="/"replace/>}