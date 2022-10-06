from flask import Flask, redirect, url_for, render_template,request
from collections import defaultdict
from sklearn.preprocessing import StandardScaler,Normalizer
from sklearn.manifold import MDS
import pandas as pd
import numpy as np
import json
app = Flask(__name__)
#read data into dataframe
df = pd.read_csv("static/data/KingsCountySales_no_outliers.csv")

#df = pd.read_csv("static/data/randomsampbrooklyn.csv")
#set only 8 variables for our dataframe
df = df[['sale_month','sale_day','total_units','land_sqft','gross_sqft','sale_price','NumBldgs','NumFloors']]
#print(df.info())
#dictionary of correlation values between different variables and the aggregate sum of values for each
corr_dict = {}
corr_sums = defaultdict(int)
eig_vecs_list = []
points = []
eig_pairs=[]
def setup(df):
    for x in df.columns:
        sum =0 
        for y in df.columns:
            corr_dict[str(x)+":"+str(y)]=df[x].corr(df[y])
            sum+=abs(df[x].corr(df[y]))
        corr_sums[x]+=sum
    X_std = StandardScaler().fit_transform(df)
    mean_vec = np.mean(X_std,axis=0)
    matrix = (X_std - mean_vec).T.dot((X_std-mean_vec))/(X_std.shape[0]-1)
    eig_vals, eig_vecs = np.linalg.eig(matrix)
    for i in eig_vecs:
        global eig_vecs_list
        eig_vecs_list += [i.tolist()]
    global eig_pairs
    eig_pairs = [(np.abs(eig_vals[i]),eig_vecs_list[i]) for i in range(len(eig_vals))]
    eig_pairs.sort(key= lambda x:x[0], reverse=True)
    
    pc1 = pd.Series(eig_pairs[0][1])
    pc2 = pd.Series(eig_pairs[1][1])
    xval=X_std.dot(pc1)
    yval=X_std.dot(pc2)
    #print(df.iloc[1]['sale_month'])
    for i in range(len(xval)):
        global points
        points+=[[xval[i],yval[i],df.iloc[i]['sale_month'],df.iloc[i]['sale_price'],df.iloc[i]['gross_sqft'],df.iloc[i]['NumFloors']]]
setup(df)




#ROUTES
@app.route('/')
def index():
    return render_template("index.html",corr_dict = corr_dict,corr_sums=corr_sums,eig_pairs= eig_pairs,points=points)


if __name__=='__main__':
    app.run(debug=True)